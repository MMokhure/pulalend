# PulaLend API Documentation

## Borrower Endpoints

### Loan Application
**POST** `/api/borrower/loan-application`
```json
{
  "amount": 5000,
  "purpose": "Business expansion",
  "duration_months": 12,
  "employment_status": "Employed",
  "monthly_income": 8000
}
```
Response: `{ success: true, loanId: 123, matchedLenders: [...] }`

### Repayment Dashboard
**GET** `/api/borrower/repayment-dashboard`
Response: `{ loans: [...], schedules: [...], payments: [...] }`

### Make Payment
**POST** `/api/borrower/repayments/pay`
```json
{
  "repaymentId": 45,
  "amount": 500
}
```

---

## Lender Endpoints

### View Available Loan Opportunities
**GET** `/api/lender/opportunities`
Response: `{ opportunities: [...] }` with risk assessment data

### Create Loan Offer
**POST** `/api/loan-offers`
```json
{
  "loan_application_id": 10,
  "offered_rate": 15.5,
  "amount": 5000,
  "tenure_months": 12
}
```

### Confirm/Decline Accepted Offer
**POST** `/api/loan-offers/confirm`
```json
{
  "offerId": 5,
  "action": "confirm"
}
```

### View Withdrawals
**GET** `/api/lender/withdrawals`
Response: `{ balance: 10000, withdrawals: [...] }`

### Request Withdrawal
**POST** `/api/lender/withdrawals/request`
```json
{
  "amount": 2000
}
```

---

## Loan Offer Endpoints

### List Offers for a Loan
**GET** `/api/loan-offers?loanId=10`
Response: `{ offers: [...] }`

### Accept Offer (Borrower)
**POST** `/api/loan-offers/accept`
```json
{
  "offerId": 5
}
```

---

## Loan Disbursement

### Disburse Loan
**POST** `/api/loans/disburse`
```json
{
  "loanId": 10
}
```
Response: `{ success: true, disburseAmount: 4850 }` (after 3% fee)

---

## Admin Endpoints

### KYC Management
**GET** `/api/admin/kyc?status=pending`
Response: `{ kycRequests: [...] }`

**POST** `/api/admin/kyc/review`
```json
{
  "kycId": 7,
  "action": "approve",
  "reason": ""
}
```

### Withdrawal Management
**GET** `/api/admin/withdrawals`
Response: `{ withdrawals: [...] }`

**POST** `/api/admin/withdrawals/approve`
```json
{
  "withdrawalId": 12,
  "action": "approve",
  "notes": "Processed via bank transfer"
}
```

### Dashboard
**GET** `/api/admin/dashboard`
Response: Complete platform statistics

---

## Frontend Pages

### Borrower
- `/borrower/loan-application` - Apply for a loan
- `/borrower/repayments` - View and make repayments
- `/borrower/dashboard` - Overview
- `/borrower/kyc` - Submit KYC documents

### Lender
- `/lender/opportunities` - Browse loans to fund
- `/lender/investments` - View active investments
- `/lender/withdrawals` - Request withdrawals
- `/lender/profile` - Manage preferences and add funds

### Admin
- `/admin/kyc` - Review KYC submissions
- `/admin/withdrawals` - Approve/reject withdrawal requests
- `/admin/loans` - Manage loan requests
- `/admin/dashboard` - Platform statistics

---

## Business Logic

### Origination Fee
- **3%** of loan amount deducted at disbursement
- Goes to platform account
- Example: P5,000 loan → P4,850 to borrower, P150 to platform

### Interest Spread
- Borrower pays: Lender rate + 1.5%
- Platform keeps: 1.5% of interest
- Example: 15% lender rate → borrower pays 16.5% effective rate

### Late Penalties
- **2% per month** of overdue amount, prorated daily
- Calculated as: `amount * 0.02 * (days_overdue / 30)`
- Applied when repayment becomes overdue

### Loan Statuses
- `pending` - Application submitted
- `matched` - Offer accepted by borrower
- `approved` - Lender confirmed offer
- `active` - Loan disbursed
- `completed` - Fully repaid
- `defaulted` - 90 days overdue

### Repayment Statuses
- `pending` - Not yet due
- `paid` - Fully paid
- `partial` - Partially paid
- `overdue` - Past due date

---

## Scheduled Tasks

### Late Payment Checker
Run daily via cron:
```javascript
// scripts/late-payment-cron.js
import { runLatePaymentCron } from './late-payment-cron.js';
runLatePaymentCron();
```

Tasks performed:
1. Mark overdue repayments
2. Calculate and apply penalties
3. Send notifications to borrowers and lenders
4. Mark loans as defaulted after 90 days

---

## Notification Types

### Borrower Notifications
- Loan offer accepted by lender
- Loan offer declined by lender
- Loan disbursed
- Repayment overdue
- Loan defaulted
- KYC approved
- KYC rejected

### Lender Notifications
- Borrower accepted your offer
- Funds added to account
- Investment confirmed
- Repayment received
- Loan defaulted
- Withdrawal approved
- Withdrawal rejected

### Admin Notifications
- New KYC submission
- New withdrawal request
- New loan application

---

## Error Handling

All endpoints return consistent error format:
```json
{
  "error": "Error message here"
}
```

Common HTTP status codes:
- `200` - Success
- `400` - Bad request (validation error)
- `401` - Unauthorized (not logged in)
- `403` - Forbidden (wrong user type or unverified)
- `404` - Not found
- `500` - Server error
