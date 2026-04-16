# Database Migration Guide

## Quick Setup

Run these commands in order to set up all required database tables:

```bash
# Navigate to project directory
cd c:\Users\Dr Mpoma\Documents\pulalend

# Run migrations (adjust path and credentials as needed)
mysql -u root -p pulalend < database/migration-loan-offers.sql
mysql -u root -p pulalend < database/migration-loan-agreements.sql
mysql -u root -p pulalend < database/migration-withdrawals.sql
```

---

## Migration Files

### 1. migration-loan-offers.sql
Creates `loan_offers` table for lender loan offers.

**Columns:**
- id (PK)
- loan_application_id (FK → loan_requests)
- lender_id (FK → users)
- offered_rate (interest rate)
- amount
- tenure_months
- status (pending/accepted/declined/expired)
- expires_at (48 hours from creation)
- timestamps

### 2. migration-loan-agreements.sql
Creates `loan_agreements` table for signed loan contracts.

**Columns:**
- id (PK)
- loan_id (FK → loan_requests)
- lender_id (FK → users)
- borrower_id (FK → users)
- amount
- interest_rate
- tenure_months
- start_date
- agreement_text
- created_at

### 3. migration-withdrawals.sql
Creates `withdrawals` table for lender withdrawal requests.

**Columns:**
- id (PK)
- user_id (FK → users)
- amount
- status (pending/approved/rejected/processed)
- admin_notes
- created_at
- reviewed_at
- reviewed_by (FK → users)
- processed_at

---

## Verifying Migrations

After running migrations, verify tables exist:

```sql
USE pulalend;
SHOW TABLES;

-- Should include:
-- loan_offers
-- loan_agreements
-- withdrawals
```

Check table structure:
```sql
DESCRIBE loan_offers;
DESCRIBE loan_agreements;
DESCRIBE withdrawals;
```

---

## Rollback (if needed)

To remove these tables:

```sql
DROP TABLE IF EXISTS loan_offers;
DROP TABLE IF EXISTS loan_agreements;
DROP TABLE IF EXISTS withdrawals;
```

**Warning**: This will delete all data in these tables!

---

## Table Relationships

```
users
  ├── borrower_profiles
  ├── lender_profiles
  └── loan_requests
        ├── loan_offers
        ├── loan_agreements
        ├── investments
        └── repayment_schedules
```

---

## Testing Data

After migrations, you can add test data:

```sql
-- Test loan offer
INSERT INTO loan_offers (loan_application_id, lender_id, offered_rate, amount, tenure_months, expires_at)
VALUES (1, 3, 15.00, 5000, 12, DATE_ADD(NOW(), INTERVAL 48 HOUR));

-- Check result
SELECT * FROM loan_offers;
```

---

## Common Issues

**Issue**: "Table already exists"
**Solution**: Drop table first or skip migration if intentional

**Issue**: "Foreign key constraint fails"
**Solution**: Ensure referenced tables exist (users, loan_requests must be created first)

**Issue**: "Access denied"
**Solution**: Check MySQL credentials and database permissions
