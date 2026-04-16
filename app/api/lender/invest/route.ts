import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";
import { EmailService } from "@/lib/emailService";

function addMonths(date: Date, months: number) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, loanId, amount } = body;

    if (!userId || !loanId || !amount) {
      return NextResponse.json(
        { error: "userId, loanId and amount are required" },
        { status: 400 }
      );
    }

    const lenderId = Number(userId);
    const loanRequestId = Number(loanId);
    const investAmount = Number(amount);

    if (!Number.isFinite(lenderId) || !Number.isFinite(loanRequestId) || !Number.isFinite(investAmount)) {
      return NextResponse.json({ error: "Invalid numeric input" }, { status: 400 });
    }

    if (investAmount <= 0) {
      return NextResponse.json({ error: "Amount must be > 0" }, { status: 400 });
    }

    // Validate lender
    const [userRows] = await pool.execute<RowDataPacket[]>(
      "SELECT id, user_type, email, first_name, last_name FROM users WHERE id = ?",
      [lenderId]
    );
    if (userRows.length === 0 || userRows[0].user_type !== "lender") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const user = userRows[0];

    // Get loan and current funded amount
    const [loanRows] = await pool.execute<RowDataPacket[]>(
      `SELECT id, loan_number AS loanNumber, borrower_id AS borrowerId, amount, interest_rate AS interestRate, duration_months AS durationMonths, status
       FROM loan_requests
       WHERE id = ?`,
      [loanRequestId]
    );

    if (loanRows.length === 0) {
      return NextResponse.json({ error: "Loan not found" }, { status: 404 });
    }

    const loan = loanRows[0];
    if (loan.status !== "approved") {
      return NextResponse.json(
        { error: "Loan is not open for funding" },
        { status: 400 }
      );
    }

    // Get lender's commission rate
    const [lenderProfileRows] = await pool.execute<RowDataPacket[]>(
      "SELECT commission_rate FROM lender_profiles WHERE user_id = ?",
      [lenderId]
    );
    const commissionRate = lenderProfileRows.length > 0 && lenderProfileRows[0].commission_rate 
      ? Number(lenderProfileRows[0].commission_rate) / 100 
      : 0.02; // Default 2% if not set

    const [fundedRows] = await pool.execute<RowDataPacket[]>(
      "SELECT COALESCE(SUM(amount),0) AS fundedAmount FROM investments WHERE loan_id = ?",
      [loanRequestId]
    );

    const principal = Number(loan.amount);
    const alreadyFunded = Number(fundedRows?.[0]?.fundedAmount ?? 0);
    const remaining = principal - alreadyFunded;

    if (investAmount > remaining) {
      return NextResponse.json(
        { error: `Amount exceeds remaining funding (P${remaining.toFixed(2)})` },
        { status: 400 }
      );
    }

    // Calculate interest profit for this investment
    const durationMonths = Number(loan.durationMonths);
    const interestRate = Number(loan.interestRate);
    const interestProfit = investAmount * (interestRate / 100) * (durationMonths / 12);
    
    // Platform takes commission from PROFIT (interest), not from principal
    const platformCommission = interestProfit * commissionRate;
    const netProfit = interestProfit - platformCommission;

    // Expected return: full principal + net profit after commission
    const expectedReturn = investAmount + netProfit;

    // Write investment + transaction
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const [invResult] = await conn.execute(
        `INSERT INTO investments (lender_id, loan_id, amount, expected_return, actual_return, platform_commission, status)
         VALUES (?, ?, ?, ?, 0, ?, 'active')`,
        [lenderId, loanRequestId, investAmount, expectedReturn, platformCommission]
      );

      const investmentId = (invResult as any).insertId;

      await conn.execute(
        `INSERT INTO transactions (user_id, transaction_type, amount, reference_id, reference_type, description, status)
         VALUES (?, 'investment', ?, ?, 'investment', ?, 'completed')`,
        [
          lenderId,
          investAmount,
          investmentId,
          `Investment in loan #${loanRequestId} (${(commissionRate * 100).toFixed(2)}% platform fee from profit: P${platformCommission.toFixed(2)})`,
        ]
      );

      // If fully funded: activate loan and generate repayment schedule
      // Full investment amount goes to borrower (commission taken from interest later)
      const newFunded = alreadyFunded + investAmount;
      const fullyFunded = newFunded >= principal;

      if (fullyFunded) {
        await conn.execute(
          "UPDATE loan_requests SET status='active', funded_at=NOW(), updated_at=NOW() WHERE id = ?",
          [loanRequestId]
        );

        // Generate schedule (equal monthly payments, simple interest)
        const totalInterest = principal * (interestRate / 100) * (durationMonths / 12);
        const monthlyPrincipal = principal / durationMonths;
        const monthlyInterest = totalInterest / durationMonths;
        const monthlyTotal = monthlyPrincipal + monthlyInterest;

        // Start due date next month (same day)
        const start = addMonths(new Date(), 1);

        for (let i = 1; i <= durationMonths; i++) {
          const dueDate = addMonths(start, i - 1);
          const dueDateStr = dueDate.toISOString().slice(0, 10);
          await conn.execute(
            `INSERT INTO repayment_schedules
               (loan_id, installment_number, due_date, principal_amount, interest_amount, total_amount, paid_amount, status)
             VALUES (?, ?, ?, ?, ?, ?, 0, 'pending')`,
            [loanRequestId, i, dueDateStr, monthlyPrincipal, monthlyInterest, monthlyTotal]
          );
        }
      }

      await conn.commit();

      // Send email notification (async, don't wait)
      EmailService.sendInvestmentConfirmation(
        user.email,
        `${user.first_name} ${user.last_name}`,
        loan.loanNumber,
        investAmount,
        expectedReturn
      ).catch(err => console.error('Email send error:', err));

      return NextResponse.json({
        success: true,
        fullyFunded,
        platformCommission,
        investedAmount: investAmount,
        commissionRate: (commissionRate * 100).toFixed(2) + '%',
      });
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error("Invest error:", error);
    return NextResponse.json({ error: "Failed to fund loan" }, { status: 500 });
  }
}
