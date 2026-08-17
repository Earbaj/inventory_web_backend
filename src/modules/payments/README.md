# 💵 Payments Module Documentation (`src/modules/payments`)

## 📌 Module Overview
The **Payments Module** handles customer due collections (receiving cash/bKash payments against outstanding customer balances), updates customer closing balance, saves payment transaction records, and writes automatic entries in the Customer Ledger statement.

---

## 📁 File Structure & Creation Order

1. **`schemas/payment.schema.ts`**: MongoDB Customer Payment transaction schema.
2. **`dto/payment.dto.ts`**: Validation DTO for processing payments.
3. **`payments.service.ts`**: Business logic for processing payments, updating closing balances, and creating ledger entries.
4. **`payments.controller.ts`**: HTTP REST API routes exposing payment endpoints.
5. **`payments.service.spec.ts`**: Unit test suite for `PaymentsService`.
6. **`payments.module.ts`**: NestJS module registering Payment, Customer, and Ledger schemas.

---

## 📄 File Roles & Method Breakdown

### 1. `payment.schema.ts`
- `customerId`: Foreign key reference to `Customer`.
- `amount`: Collected payment amount.
- `paymentMethod`: Method used (`cash`, `bkash`, `nagad`, `card`, `bank`).
- `date`: Payment timestamp.
- `receivedBy`: Staff/Cashier user ID who received payment.
- `shopId`, `isDeleted`, `deletedAt`, `deletedBy`: Multi-tenancy & soft-delete fields.

### 2. `payment.dto.ts`
- `ProcessPaymentDto`: `customerId`, `amount`, `paymentMethod`.

### 3. `payments.service.ts`
- **`processPayment(dto, user)`**:
  1. Finds customer by ID for `user.shopId`. Throws `404 Not Found` if missing.
  2. Updates customer closing balance (`closingBalance += amount`), reducing due or increasing advance.
  3. Creates Payment transaction document in MongoDB.
  4. Writes `'payment'` entry in Customer Ledger statement with previous and new balance.

### 4. `payments.controller.ts`
- `POST /api/payments` (Authenticated)
