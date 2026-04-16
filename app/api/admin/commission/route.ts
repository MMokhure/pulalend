import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

/**
 * GET /api/admin/commission
 * Get platform commission data with filtering by date range
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const month = searchParams.get("month"); // Format: YYYY-MM
    const loanId = searchParams.get("loanId");

    // Build the query
    let query = `
      SELECT 
        i.id,
        i.loan_id,
        i.lender_id,
        i.amount as investment_amount,
        i.platform_commission,
        i.invested_at,
        i.status as investment_status,
        lr.loan_number,
        lr.amount as loan_amount,
        lr.interest_rate,
        lr.duration_months,
        lr.borrower_id,
        CONCAT(lender.first_name, ' ', lender.last_name) as lender_name,
        lender.email as lender_email,
        CONCAT(borrower.first_name, ' ', borrower.last_name) as borrower_name,
        borrower.email as borrower_email,
        DATE_FORMAT(i.invested_at, '%Y-%m') as commission_month,
        DATE_FORMAT(i.invested_at, '%Y-%m-%d') as commission_date
      FROM investments i
      JOIN loan_requests lr ON i.loan_id = lr.id
      JOIN users lender ON i.lender_id = lender.id
      JOIN users borrower ON lr.borrower_id = borrower.id
      WHERE i.platform_commission > 0
    `;

    const params: any[] = [];

    // Filter by date range
    if (startDate && endDate) {
      query += " AND DATE(i.invested_at) BETWEEN ? AND ?";
      params.push(startDate, endDate);
    }

    // Filter by specific month
    if (month) {
      query += " AND DATE_FORMAT(i.invested_at, '%Y-%m') = ?";
      params.push(month);
    }

    // Filter by specific loan
    if (loanId) {
      query += " AND i.loan_id = ?";
      params.push(Number(loanId));
    }

    query += " ORDER BY i.invested_at DESC";

    const [commissionRows] = await pool.execute<RowDataPacket[]>(query, params);

    // Calculate totals
    const totalCommission = commissionRows.reduce(
      (sum, row) => sum + Number(row.platform_commission),
      0
    );

    const totalInvestments = commissionRows.reduce(
      (sum, row) => sum + Number(row.investment_amount),
      0
    );

    // Group by month
    const byMonth: Record<string, any> = {};
    commissionRows.forEach((row) => {
      const month = row.commission_month;
      if (!byMonth[month]) {
        byMonth[month] = {
          month,
          totalCommission: 0,
          totalInvestments: 0,
          count: 0,
          loans: new Set()
        };
      }
      byMonth[month].totalCommission += Number(row.platform_commission);
      byMonth[month].totalInvestments += Number(row.investment_amount);
      byMonth[month].count += 1;
      byMonth[month].loans.add(row.loan_id);
    });

    // Convert to array and format
    const monthlyData = Object.values(byMonth).map((m: any) => ({
      month: m.month,
      totalCommission: m.totalCommission,
      totalInvestments: m.totalInvestments,
      count: m.count,
      uniqueLoans: m.loans.size
    }));

    // Group by loan
    const byLoan: Record<number, any> = {};
    commissionRows.forEach((row) => {
      const loanId = row.loan_id;
      if (!byLoan[loanId]) {
        byLoan[loanId] = {
          loanId,
          loanNumber: row.loan_number,
          borrowerName: row.borrower_name,
          loanAmount: Number(row.loan_amount),
          totalCommission: 0,
          totalInvested: 0,
          investmentCount: 0
        };
      }
      byLoan[loanId].totalCommission += Number(row.platform_commission);
      byLoan[loanId].totalInvested += Number(row.investment_amount);
      byLoan[loanId].investmentCount += 1;
    });

    const loanData = Object.values(byLoan);

    return NextResponse.json({
      summary: {
        totalCommission,
        totalInvestments,
        transactionCount: commissionRows.length,
        uniqueLoans: Object.keys(byLoan).length,
        averageCommission: commissionRows.length > 0 ? totalCommission / commissionRows.length : 0
      },
      monthlyData: monthlyData.sort((a, b) => b.month.localeCompare(a.month)),
      loanData: loanData.sort((a, b) => b.totalCommission - a.totalCommission),
      transactions: commissionRows.map((row) => ({
        id: row.id,
        loanId: row.loan_id,
        loanNumber: row.loan_number,
        lenderId: row.lender_id,
        lenderName: row.lender_name,
        lenderEmail: row.lender_email,
        borrowerName: row.borrower_name,
        borrowerEmail: row.borrower_email,
        investmentAmount: Number(row.investment_amount),
        commission: Number(row.platform_commission),
        commissionRate: (Number(row.platform_commission) / Number(row.investment_amount) * 100).toFixed(2) + '%',
        investedAt: row.invested_at,
        month: row.commission_month,
        status: row.investment_status
      }))
    });
  } catch (error) {
    console.error("Commission GET error:", error);
    return NextResponse.json(
      { error: "Failed to load commission data" },
      { status: 500 }
    );
  }
}
