# 👥 Customers Module Documentation (`src/modules/customers`)

## 📌 Module Overview
The **Customers Module** manages customer profiles, opening/closing balances (positive = advance, negative = due), customer ledger statement histories (`sale`, `payment`, `return`, `opening`), soft-deletion, and multi-tenancy shop isolation (`shopId`).

---

## 📁 File Structure & Creation Order

1. **`schemas/customer.schema.ts`**: MongoDB Customer schema.
2. **`schemas/ledger.schema.ts`**: MongoDB Customer Ledger statement history schema.
3. **`dto/customer.dto.ts`**: Validation DTOs for creating and updating customers.
4. **`customers.service.ts`**: Business logic for customer CRUD, ledger entries, soft-delete, and Free Tier limits.
5. **`customers.controller.ts`**: HTTP REST API routes exposing customer endpoints.
6. **`customers.service.spec.ts`**: Unit test suite for `CustomersService`.
7. **`customers.module.ts`**: NestJS module registering Customer and Ledger schemas.

---

## 📄 File Roles & Method Breakdown

### 1. `customer.schema.ts`
- `name`: Customer name.
- `phone`: Customer contact number.
- `address`: Customer address.
- `openingBalance`: Initial balance when registering customer.
- `closingBalance`: Current balance (updated automatically upon sales, payments, and returns).
- `shopId`: Multi-tenancy shop identifier.
- `isDeleted`, `deletedAt`, `deletedBy`: Soft-delete recycle bin fields.

### 2. `ledger.schema.ts`
- `customerId`: Foreign key reference to `Customer`.
- `type`: Enum `['sale', 'payment', 'return', 'opening']`.
- `referenceId`: ID of the sale invoice, payment, or return transaction.
- `date`: Transaction timestamp.
- `description`: Transaction description string (e.g. `Invoice #INV-20260817-0001`).
- `amount`: Transaction amount.
- `previousBalance`: Customer closing balance before this transaction.
- `newBalance`: Customer closing balance after this transaction.
- `shopId`, `isDeleted`, `deletedAt`, `deletedBy`: Multi-tenancy & soft-delete fields.

### 3. `customer.dto.ts`
- `CreateCustomerDto`: `name`, `phone`, `address`, `openingBalance`.
- `UpdateCustomerDto`: `name`, `phone`, `address`.

### 4. `customers.service.ts`
- **`create(dto, user)`**: Registers new customer and creates initial `'opening'` balance ledger entry. Enforces Free Tier Limit: Maximum 1 Customer per free tier shop.
- **`findAll(user)`**: Returns active customers (`isDeleted: false`) for `user.shopId`.
- **`findOne(id, user)`**: Fetches customer profile by ID.
- **`update(id, dto, user)`**: Updates customer name, phone, address.
- **`remove(id, user)`**: Performs soft-delete (`isDeleted: true`). Marks both customer and associated ledger records as soft-deleted.
- **`getLedger(customerId, user)`**: Returns chronological statement history records for the customer.

### 5. `customers.controller.ts`
- `POST /api/customers` (Authenticated, Max 1 for Free Tier)
- `GET /api/customers` (Authenticated)
- `GET /api/customers/:id` (Authenticated)
- `PUT /api/customers/:id` (Requires permission: `canEditCustomers`)
- `DELETE /api/customers/:id` (Requires permission: `canEditCustomers`, soft-deletes)
- `GET /api/customers/:id/ledger` (Authenticated)
