# 🔄 Returns Module Documentation (`src/modules/returns`)

## 📌 Module Overview
The **Returns Module** processes product returns from existing sales invoices, automatically restocks inventory items (`stockQuantity += quantity`), recalculates invoice totals & due amounts, updates customer closing balance & ledger statements, and enforces role permissions (`canProcessReturn`).

---

## 📁 File Structure & Creation Order

1. **`schemas/return.schema.ts`**: MongoDB Return transaction schema & embedded returned item detail schema.
2. **`dto/return.dto.ts`**: Validation DTOs for returned items input.
3. **`returns.service.ts`**: Business logic for sales returns, inventory restocking, invoice recalculation, and customer ledger updates.
4. **`returns.controller.ts`**: HTTP REST API routes exposing return endpoints.
5. **`returns.service.spec.ts`**: Unit test suite for `ReturnsService`.
6. **`returns.module.ts`**: NestJS module registering Return, Sale, Item, Customer, and Ledger schemas.

---

## 📄 File Roles & Method Breakdown

### 1. `return.schema.ts`
- `customerId`: Customer ID.
- `saleId`: Reference ID of original Sale invoice.
- `invoiceNumber`: Invoice number code.
- `returnedItems`: Embedded list of returned items (`itemId`, `name`, `quantity`, `refundAmountPerUnit`).
- `totalRefund`: Total refund amount.
- `date`: Return timestamp.
- `processedBy`: User ID of staff/admin who processed return.
- `shopId`, `isDeleted`, `deletedAt`, `deletedBy`: Multi-tenancy & soft-delete fields.

### 2. `return.dto.ts`
- `ReturnItemInputDto`: `itemId`, `quantity`.
- `ProcessReturnDto`: `customerId`, `saleId`, `returnedItems`.

### 3. `returns.service.ts`
- **`processReturn(dto, user)`**:
  1. Finds original sale invoice. Throws `404 Not Found` if missing.
  2. Calculates unit refund price taking into account per-item discounts (percent or amount).
  3. Restocks inventory items (`stockQuantity += returnedQty`) in MongoDB.
  4. Recalculates sale invoice `subtotal`, `grandTotal`, `dueAmount`, `paymentStatus`, and sets `isReturned` status (`partially_returned` or `fully_returned`).
  5. Saves Return transaction record in database.
  6. If registered customer (`customerId !== 'walk-in'`), credits customer closing balance (`closingBalance += totalRefund`) and writes `'return'` entry in Customer Ledger.
- **`findAllReturns(user)`**: Lists active return transactions (`isDeleted: false`) for `user.shopId`.

### 4. `returns.controller.ts`
- `POST /api/returns` (Requires permission: `canProcessReturn`)
- `GET /api/returns` (Authenticated)
