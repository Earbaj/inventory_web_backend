# 💳 Subscriptions Module Documentation (`src/modules/subscriptions`)

## 📌 Module Overview
The **Subscriptions Module** manages SaaS pricing packages, manual bKash/Nagad/Bank payment request submissions with TrxID, SuperAdmin review & pending lists, approval with 30/365 days expiry calculation extending active tier dates, tier upgrades for shop owners & managers, and payment rejections.

---

## 📁 File Structure & Creation Order

1. **`schemas/subscription-payment.schema.ts`**: MongoDB Subscription Payment request schema.
2. **`dto/subscription.dto.ts`**: Validation DTOs for manual payments and rejection reasons.
3. **`subscriptions.service.ts`**: Business logic for package catalogue, manual payment submissions, pending queues, SuperAdmin approval & expiry extension calculation.
4. **`subscriptions.controller.ts`**: HTTP REST API routes exposing subscription endpoints.
5. **`subscriptions.service.spec.ts`**: Unit test suite for `SubscriptionsService`.
6. **`subscriptions.module.ts`**: NestJS module registering SubscriptionPayment and User schemas.

---

## 📄 File Roles & Method Breakdown

### 1. `subscription-payment.schema.ts`
- `userId`: Shop Owner user ID.
- `shopId`: Shop ID.
- `packageId`: Package identifier (`free`, `premium_monthly`, `premium_yearly`).
- `amount`: Payment amount in BDT.
- `paymentMethod`: Enum `['manual_bkash', 'manual_nagad', 'manual_bank']`.
- `trxId`: Transaction ID submitted by user.
- `accountNo`: Mobile/Bank account number used to send payment.
- `status`: Enum `['pending', 'approved', 'rejected']`.
- `rejectionReason`: Reason text if rejected.
- `approvedAt`, `approvedBy`: Approval metadata.

### 2. `subscription.dto.ts`
- `SubmitManualPaymentDto`: `packageId`, `amount`, `paymentMethod`, `trxId`, `accountNo`.
- `RejectPaymentDto`: `reason`.

### 3. `subscriptions.service.ts`
- **`getPackages()`**: Public catalog returning Free Starter (0 BDT), Premium Monthly (1,000 BDT / 30 days), and Premium Yearly (10,000 BDT / 365 days).
- **`getPaymentInfo()`**: Returns bKash/Nagad merchant number and step-by-step payment instructions.
- **`submitManualPayment(dto, user)`**: Allows Shop Admin to submit manual payment details with TrxID. Saves with status `'pending'`.
- **`getMyPaymentRequests(user)`**: Returns payment submission history for the logged-in shop owner.
- **`getPendingPayments(user)`**: Returns all pending payment requests across system for SuperAdmin review.
- **`approvePayment(paymentId, superAdminUser)`**:
  1. Verifies caller is SuperAdmin.
  2. Calculates extension days (+30 days for monthly, +365 days for yearly).
  3. Expiration Calculation Logic: Extends from existing `subscriptionExpiresAt` if in future, otherwise from `NOW`.
  4. Upgrades Shop Owner & all linked Manager accounts to `subscriptionTier = 'premium'` and sets new expiry date.
  5. Updates payment status to `'approved'`.
- **`rejectPayment(paymentId, dto, superAdminUser)`**: Rejects payment request with reason string.

### 4. `subscriptions.controller.ts`
- `GET /api/subscriptions/packages` (Public)
- `GET /api/subscriptions/payment-info` (Public)
- `POST /api/subscriptions/payments/manual` (Shop Admin Only)
- `GET /api/subscriptions/payments/my` (Authenticated)
- `GET /api/subscriptions/payments/pending` (SuperAdmin Only)
- `PATCH /api/subscriptions/payments/:id/approve` (SuperAdmin Only)
- `PATCH /api/subscriptions/payments/:id/reject` (SuperAdmin Only)
