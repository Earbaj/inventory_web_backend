# 🛒 Sales Module Documentation (`src/modules/sales`)

## 📌 Module Overview
The **Sales Module** powers POS checkout transactions, automatic invoice serial number generation (`INV-YYYYMMDD-XXXX`), line-item & global discounts, stock deduction upon sale, customer due tracking, customer closing balance & ledger updates, soft-deletion, and multi-tenancy shop isolation (`shopId`).

---

## 📁 File Structure & Creation Order

1. **`schemas/sale.schema.ts`**: MongoDB Sale invoice schema & embedded sold item schema.
2. **`dto/sales.dto.ts`**: Validation DTOs for POS checkout checkout items.
3. **`sales.service.ts`**: Business logic for atomic POS checkout, stock deduction, invoice numbering, customer ledger entries, and Free Tier limits.
4. **`sales.controller.ts`**: HTTP REST API routes exposing sales endpoints.
5. **`sales.service.spec.ts`**: Unit test suite for `SalesService`.
6. **`sales.module.ts`**: NestJS module registering Sale, Item, Customer, and Ledger schemas.

---

## 📄 File Roles & Method Breakdown

### 1. `sale.schema.ts`
- `invoiceNumber`: Unique invoice code per shop (e.g. `INV-20260817-0001`).
- `customerId`: Customer ID (`walk-in` for general customers).
- `customerName`, `customerPhone`: Customer contact info.
- `items`: Embedded list of sold items (`itemId`, `name`, `quantity`, `unitPrice`, `discount`, `discountType`, `totalPrice`).
- `subtotal`: Items total before overall discount.
- `discount`: Global invoice discount.
- `grandTotal`: Final invoice total (`subtotal - discount`).
- `paidAmount`: Cash collected amount.
- `dueAmount`: Remaining due (`grandTotal - paidAmount`).
- `paymentStatus`: Enum `['paid', 'partial', 'due']`.
- `createdBy`, `createdByName`: Cashier / Staff who generated invoice.
- `isReturned`: Enum `['none', 'partially_returned', 'fully_returned']`.
- `shopId`, `isDeleted`, `deletedAt`, `deletedBy`: Multi-tenancy & soft-delete fields.

### 2. `sales.dto.ts`
- `SaleItemDto`: `itemId`, `quantity`, `unitPrice`, `discount`, `discountType`.
- `CreateSaleDto`: `customerId`, `customerName`, `customerPhone`, `items`, `discount`, `paidAmount`.

### 3. `sales.service.ts`
- **`createSale(dto, user)`**:
  1. Enforces Free Tier Limit: Maximum 5 Sales transactions per free tier shop.
  2. Verifies inventory stock availability for each item. Throws `400 Bad Request` if insufficient stock.
  3. Deducts item `stockQuantity -= quantity` from inventory.
  4. Generates unique invoice number `INV-YYYYMMDD-XXXX` for `user.shopId`.
  5. If registered customer (`customerId !== 'walk-in'`), calculates new customer balance (`paidAmount - grandTotal`) and creates `'sale'` entry in Customer Ledger.
- **`findAllSales(user, cashierId, paymentStatus)`**: Lists active sales invoices (`isDeleted: false`) for `user.shopId`.
- **`findOneSale(id, user)`**: Fetches sale invoice details by ID.
- **`findByInvoice(invoiceNumber, user)`**: Fetches invoice details by invoice code.
- **`formatSale(sale)`**: Formats sale response object.

### 4. `sales.controller.ts`
- `POST /api/sales` (Authenticated, Max 5 for Free Tier)
- `GET /api/sales` (Authenticated, optional `?cashierId=...`, `?paymentStatus=...`)
- `GET /api/sales/invoice/:invoiceNumber` (Authenticated)
- `GET /api/sales/:id` (Authenticated)
