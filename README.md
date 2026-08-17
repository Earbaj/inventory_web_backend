# ⚡ Keeper POS — Multi-Tenant SaaS Backend (NestJS + MongoDB)

Welcome to the **Keeper POS Backend API Service**! Built with **NestJS**, **TypeScript**, and **MongoDB (Mongoose ODM)**, this enterprise-grade service provides Point of Sale billing, multi-tenancy shop isolation, API rate limiting, manual bKash subscription payments, soft-delete data recovery (Recycle Bin), password recovery OTP flow, and platform management for SuperAdmins.

---

## 🚀 Key Architectural Features

1. **🛡️ API Rate Limiting (`@nestjs/throttler`)**:
   - Prevents DoS attacks and API abuse using global rate-limiting guards (20 requests/minute per IP).
2. **🔑 Role-Based Access Control (RBAC) & Multi-Shop SaaS**:
   - **`superadmin`**: Platform owner (manages platform subscriptions, approves/rejects manual payments, views global metrics).
   - **`admin`**: Shop Owner (manages own shop's items, customers, sales, managers, and subscription tier).
   - **`manager`**: Shop Staff (created by Shop Admin, scoped to the creator's `shopId` with granular permissions like `canProcessReturn`, `canExportExcel`, `canEditCustomers`, `canViewBuyPrice`).
3. **🔒 Multi-Tenancy Data Isolation (`shopId`)**:
   - All items, customers, sales, returns, customer payments, and ledgers are strictly scoped by `shopId`. Users from Shop A cannot view or modify data from Shop B.
4. **👑 One-Time Initial SuperAdmin Setup (`POST /api/auth/setup-superadmin`)**:
   - Secure setup endpoint allowing initial creation of the SuperAdmin account ONLY IF zero SuperAdmin accounts exist in MongoDB. Once created, subsequent calls return `403 Forbidden`.
5. **🔐 Password Recovery OTP System**:
   - `POST /api/auth/forgot-password`: Generates a 6-digit numeric OTP code valid for 15 minutes, logged in dev console and saved to user schema.
   - `POST /api/auth/reset-password`: Verifies email, code, and expiry before updating the user password hash.
6. **🛑 Free Tier Feature Limitations**:
   - Strictly enforced in service layers when `subscriptionTier === 'free'`:
     - 👤 **Max 1 Customer** (Creating 2nd customer throws `400 Bad Request`)
     - 👥 **Max 1 Manager Account** (Creating 2nd manager throws `400 Bad Request`)
     - 📦 **Max 5 Inventory Items** (Creating 6th item throws `400 Bad Request`)
     - 🛒 **Max 5 Sales Transactions** (Creating 6th sale throws `400 Bad Request`)
7. **💳 Subscriptions & Manual bKash Payment System**:
   - **Package Catalog**: Free Starter (0 BDT), Premium Monthly (1,000 BDT / 30 days), Premium Yearly (10,000 BDT / 365 days).
   - **Manual Payment Flow**: Shop Owners submit payment details (`trxId`, `accountNo`, `packageId`, `paymentMethod: 'manual_bkash'`).
   - **SuperAdmin Approval**: SuperAdmin reviews pending payments (`PATCH /api/subscriptions/payments/:id/approve`). Extends subscription expiration by 30 or 365 days (adding onto existing active expiry date if valid, or from current timestamp) and upgrades tier to `premium`.
8. **♻️ Soft Delete & Recycle Bin / Data Recovery System**:
   - Critical data (Items, Customers, Sales, Returns) is soft-deleted (`isDeleted: true`).
   - **Recycle Bin List (`GET /api/trash`)**: Displays all soft-deleted records.
   - **Data Restore (`POST /api/trash/restore/:entityType/:id`)**: Restores deleted items back into the active database tables.
   - **Permanent Hard Delete (`DELETE /api/trash/permanent/:entityType/:id`)**: Permanently purges specific trash records from MongoDB storage.
9. **📊 Dashboards & Analytics**:
   - **Shop Dashboard (`GET /api/dashboard/stats`)**: Revenue, net profit, low-stock alerts, customer dues, invoice count.
   - **SuperAdmin Dashboard (`GET /api/dashboard/superadmin`)**: Platform total shops, manager counts, approved subscription revenue, pending payment requests count.

---

## 🛠️ Installation & Setup

### Prerequisites
- **Node.js**: v18+
- **MongoDB**: Local MongoDB instance (`mongodb://127.0.0.1:27017/keeper_pos`) or MongoDB Atlas.

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Create or update `.env` in the root folder:
```env
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/keeper_pos
JWT_SECRET=keeper_pos_super_secret_jwt_key_2026
JWT_EXPIRES_IN=7d
THROTTLE_LIMIT=20
BKASH_MERCHANT_NUMBER=01700000000
NAGAD_MERCHANT_NUMBER=01700000000
```

### 3. Seed Database
Seed default SuperAdmin, Shop Admin, Manager, Categories, Items, and Customer:
```bash
npm run seed
```

**Default Accounts Created:**
- 👑 **Super Admin**: `superadmin@keeper.com` | Password: `superadmin123`
- 🔑 **Shop Admin**: `admin@shop.com` | Password: `admin123`
- 👤 **Manager**: `manager@shop.com` | Password: `admin123`

### 4. Start Server
Run in development mode:
```bash
npm run start:dev
```
Or build and run in production:
```bash
npm run build
npm run start:prod
```

---

## 🌐 Web Dashboard & Live Swagger API

- **🖥️ Web Dashboard UI**: `http://localhost:3000/`
- **📜 Live Interactive Swagger API Docs**: `http://localhost:3000/api/docs`

---

## 📖 Complete API Reference Guide

### 1. 🔐 Authentication, SuperAdmin Setup & Password Recovery

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/setup-superadmin` | One-time initial SuperAdmin setup (Allowed only if 0 exist) | Public |
| `POST` | `/api/auth/login` | Login and receive Bearer JWT token | Public |
| `POST` | `/api/auth/register` | Register new Shop Owner (Admin) account | Public |
| `POST` | `/api/auth/forgot-password` | Request password reset 6-digit OTP code | Public |
| `POST` | `/api/auth/reset-password` | Reset password using OTP code | Public |
| `GET` | `/api/auth/me` | Get current logged-in user profile & subscription status | Authenticated |
| `GET` | `/api/users` | List shop users (or all users for SuperAdmin) | Admin / SuperAdmin |
| `POST` | `/api/users` | Create new manager account (Max 1 for Free Tier) | Admin / SuperAdmin |
| `PATCH` | `/api/users/:id/permissions` | Update manager permissions | Admin / SuperAdmin |
| `POST` | `/api/users/change-password` | Change logged-in user password | Authenticated |
| `DELETE` | `/api/users/:id` | Delete user account | Admin / SuperAdmin |

#### Sample SuperAdmin One-Time Setup Request:
```bash
curl -X POST http://localhost:3000/api/auth/setup-superadmin \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Platform Super Admin",
    "email": "superadmin@keeper.com",
    "password": "supersecret123"
  }'
```

#### Sample Forgot Password Request:
```bash
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@shop.com"}'
```

---

### 2. 💳 Subscriptions & Manual bKash Payments

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/subscriptions/packages` | List available subscription packages & limits | Public |
| `GET` | `/api/subscriptions/payment-info` | Get merchant bKash/Nagad number & payment steps | Public |
| `POST` | `/api/subscriptions/payments/manual` | Submit manual payment request with TrxID | Shop Admin |
| `GET` | `/api/subscriptions/payments/my` | Get shop's payment request history | Authenticated |
| `GET` | `/api/subscriptions/payments/pending` | List all pending payment requests | SuperAdmin Only |
| `PATCH` | `/api/subscriptions/payments/:id/approve` | Approve payment request & extend tier expiry | SuperAdmin Only |
| `PATCH` | `/api/subscriptions/payments/:id/reject` | Reject payment request with reason | SuperAdmin Only |

#### Sample Submit Manual Payment Request:
```bash
curl -X POST http://localhost:3000/api/subscriptions/payments/manual \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "packageId": "premium_monthly",
    "amount": 1000,
    "paymentMethod": "manual_bkash",
    "trxId": "BK88231920X",
    "accountNo": "01711223344"
  }'
```

---

### 3. 📦 Inventory Catalog (Free Tier Limit: Max 5 Items)

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/items` | Add product item (Max 5 for Free Tier) | Authenticated |
| `GET` | `/api/items` | List shop products (`?category=Electronics`) | Authenticated |
| `GET` | `/api/items/low-stock` | Get low stock warning products | Authenticated |
| `GET` | `/api/items/:id` | Get product details by ID | Authenticated |
| `PUT` | `/api/items/:id` | Update product details | Authenticated |
| `PATCH` | `/api/items/:id/stock` | Adjust stock quantity (+/- N) | Authenticated |
| `DELETE` | `/api/items/:id` | Delete product item (Moves to Recycle Bin) | Authenticated |
| `GET` | `/api/categories` | List product categories | Authenticated |
| `POST` | `/api/categories` | Create new product category | Authenticated |

---

### 4. 👥 Customers & Ledger Statements (Free Tier Limit: Max 1 Customer)

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/customers` | Register new customer (Max 1 for Free Tier) | Authenticated |
| `GET` | `/api/customers` | List shop customers & balances | Authenticated |
| `GET` | `/api/customers/:id` | Get customer profile | Authenticated |
| `PUT` | `/api/customers/:id` | Update customer info | Permission: `canEditCustomers` |
| `DELETE` | `/api/customers/:id` | Delete customer (Moves to Recycle Bin) | Permission: `canEditCustomers` |
| `GET` | `/api/customers/:id/ledger` | Get transaction statement ledger | Authenticated |

---

### 5. 🛒 Sales & POS Checkout Billing (Free Tier Limit: Max 5 Sales)

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/sales` | Process POS checkout transaction (Max 5 for Free Tier) | Authenticated |
| `GET` | `/api/sales` | List invoices (`?cashierId=...`, `?paymentStatus=...`) | Authenticated |
| `GET` | `/api/sales/invoice/:invoiceNumber` | Fetch invoice details by number | Authenticated |
| `GET` | `/api/sales/:id` | Get sale details by ID | Authenticated |

---

### 6. 💵 Customer Due Payments & Collections

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/payments` | Process payment against customer due balance | Authenticated |

---

### 7. 🔄 Restocking & Product Returns

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/returns` | Process product return & restock inventory | Permission: `canProcessReturn` |
| `GET` | `/api/returns` | List return transaction history | Authenticated |

---

### 8. ♻️ Recycle Bin & Data Recovery System

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/trash` | List soft-deleted items, customers, sales, and returns | Authenticated |
| `POST` | `/api/trash/restore/:entityType/:id` | Restore soft-deleted record back to active tables | Authenticated |
| `DELETE` | `/api/trash/permanent/:entityType/:id` | Permanently hard-delete record from MongoDB | Shop Admin / SuperAdmin |

#### Sample Restore Request:
```bash
curl -X POST http://localhost:3000/api/trash/restore/item/<ITEM_ID> \
  -H "Authorization: Bearer <TOKEN>"
```

---

### 9. 📊 Dashboards & Analytics

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/dashboard/stats` | Get shop KPIs (Revenue, Profit, Due, Stock Warnings) | Authenticated |
| `GET` | `/api/dashboard/superadmin` | Get platform metrics (Shops count, Revenue, Pending Payments) | SuperAdmin Only |
| `GET` | `/api/reports/sales` | Detailed sales report with date range filters | Authenticated |

---

## 💻 Tech Stack & Dependencies

- **Framework**: NestJS (v10)
- **Database**: MongoDB with Mongoose ODM (v8)
- **Security & Throttling**: `@nestjs/throttler` (20 req/min), Passport JWT, bcrypt password hashing
- **Validation**: `class-validator` & `class-transformer`
- **Documentation**: Swagger OpenAPI (`@nestjs/swagger`)
- **Frontend UI**: Responsive HTML5 + Glassmorphism Dark UI served statically.
