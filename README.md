# ⚡ Keeper POS — Multi-Tenant SaaS Backend (NestJS + MongoDB)

Welcome to the **Keeper POS Backend API Service**! Built with **NestJS**, **TypeScript**, and **MongoDB (Mongoose ODM)**, this enterprise-grade service provides Point of Sale billing, multi-tenancy shop isolation, API rate limiting, manual bKash subscription payments, soft-delete data recovery (Recycle Bin), password recovery OTP flow, staff management, health check diagnostics, module-wide data pagination, platform management for SuperAdmins, WhatsApp direct chat link generators, security activity audit logging, smart inventory forecasting, profit & top-seller analytics, and bulk CSV data export.

---

## 🚀 Key Architectural & Enterprise Features

1. **🛡️ API Rate Limiting (`@nestjs/throttler`)**:
   - Prevents DoS attacks and API abuse using global rate-limiting guards (20 requests/minute per IP).
2. **🔑 Role-Based Access Control (RBAC) & Multi-Shop SaaS**:
   - **`superadmin`**: Platform owner (manages platform subscriptions, registered shops, approves/rejects manual payments, views global metrics).
   - **`admin`**: Shop Owner (manages own shop's items, customers, sales, staff/managers, and subscription tier).
   - **`manager`**: Shop Staff (created by Shop Admin, scoped to the creator's `shopId` with granular permissions like `canProcessReturn`, `canExportExcel`, `canEditCustomers`, `canViewBuyPrice`).
3. **📄 Standardized Pagination & Search System**:
   - Universal `PaginationQueryDto` supporting `page` (default: 1), `limit` (default: 10, max: 100), `search`, `sortBy`, and `sortOrder` (`asc` / `desc`).
   - Standardized `PaginatedResult<T>` wrapper output structure.
4. **📱 WhatsApp Direct Chat Link Generator**:
   - Generates instant zero-cost WhatsApp API message links for sending formatted sales receipts and customer due payment reminders (`/api/sales/:id/whatsapp-link` and `/api/customers/:id/due-reminder-link`).
5. **🛡️ Security Audit Logs & Activity Trail**:
   - Logs security actions (user creation, stock adjustments, permission updates, trash restores) with user ID, role, action, and timestamp (`GET /api/audit-logs`).
6. **📈 Smart Inventory Reorder & Dead-Stock Insights**:
   - Automated reorder suggestions based on low stock thresholds and 30-day dead stock detection (`GET /api/items/insights`).
7. **📊 Profit Margin & Top-Seller Analytics Insights**:
   - Calculates top-selling products by volume/revenue, most profitable products, profit margins, and top valuable customers (`GET /api/dashboard/insights`).
8. **📥 Bulk CSV Data Export**:
   - Allows shop owners to download structured CSV files for inventory, customers, sales, and customer ledger statements (`GET /api/export/*`).
9. **👑 One-Time Initial SuperAdmin Setup (`POST /api/auth/setup-superadmin`)**:
   - Allows initial creation of the SuperAdmin account ONLY IF zero SuperAdmin accounts exist in MongoDB.
10. **🔐 Password Recovery OTP System**:
    - `POST /api/auth/forgot-password` (6-digit OTP code valid for 15 mins) and `POST /api/auth/reset-password`.
11. **🛑 Free Tier Feature Limitations**:
    - Strictly enforced in service layers when `subscriptionTier === 'free'`: Max 1 Customer, Max 1 Manager, Max 5 Inventory Items, Max 5 Sales Transactions.
12. **💳 Subscriptions & Manual bKash Payment System**:
    - Manual payment flow with TrxID submission and SuperAdmin approval (`PATCH /api/subscriptions/payments/:id/approve`).
13. **♻️ Soft Delete & Recycle Bin / Data Recovery System**:
    - Critical data is soft-deleted (`isDeleted: true`), viewable in Recycle Bin (`GET /api/trash`), restorable (`POST /api/trash/restore/:entityType/:id`), or hard-deletable.
14. **🏥 Health Check & System Status (`GET /api/health`)**:
    - Real-time server status, service version, uptime seconds, ISO timestamp, environment, and MongoDB database connection state.

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
- **🏥 System Health Check**: `http://localhost:3000/api/health`

---

## 📖 Complete API Reference Guide

### 0. 🏥 System Health Check & Security Audit Logs

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Health status, uptime, and DB connection state | Public |
| `GET` | `/api/audit-logs` | List security audit trail logs (Paginated, `?startDate=...`, `?action=...`) | Admin / SuperAdmin |

---

### 1. 🔐 Authentication, SuperAdmin Setup & Password Recovery

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/setup-superadmin` | One-time initial SuperAdmin setup (Allowed only if 0 exist) | Public |
| `POST` | `/api/auth/login` | Login and receive Bearer JWT token | Public |
| `POST` | `/api/auth/register` | Register new Shop Owner (Admin) account | Public |
| `POST` | `/api/auth/forgot-password` | Request password reset 6-digit OTP code | Public |
| `POST` | `/api/auth/reset-password` | Reset password using OTP code | Public |
| `GET` | `/api/auth/me` | Get current logged-in user profile & subscription status | Authenticated |
| `GET` | `/api/users` | List shop users (Paginated) | Authenticated |
| `POST` | `/api/users` | Create new manager account (Max 1 for Free Tier) | Admin / SuperAdmin |
| `PATCH` | `/api/users/:id/permissions` | Update manager permissions | Admin / SuperAdmin |
| `POST` | `/api/users/change-password` | Change logged-in user password | Authenticated |
| `DELETE` | `/api/users/:id` | Delete user account | Admin / SuperAdmin |

---

### 2. 👥 Staff Management

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/staff` | List staff members for current shop (Paginated) | Authenticated |
| `POST` | `/api/staff` | Create new staff member account | Admin / SuperAdmin |
| `GET` | `/api/staff/:id` | Get single staff member details by ID | Authenticated |
| `PATCH` | `/api/staff/:id/permissions` | Update staff member permissions | Admin / SuperAdmin |
| `DELETE` | `/api/staff/:id` | Delete staff member account | Admin / SuperAdmin |

---

### 3. 🏢 SuperAdmin Registered Shops Management

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/shops` | List registered shop accounts (Paginated) | SuperAdmin Only |
| `GET` | `/api/admin/shops/:id` | Get single shop details and managers list | SuperAdmin Only |

---

### 4. 💳 Subscriptions & Manual bKash Payments

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/subscriptions/packages` | List available subscription packages & limits | Public |
| `GET` | `/api/subscriptions/payment-info` | Get merchant bKash/Nagad number & payment steps | Public |
| `POST` | `/api/subscriptions/payments/manual` | Submit manual payment request with TrxID | Shop Admin |
| `GET` | `/api/subscriptions/payments/my` | Get shop's payment request history (Paginated) | Authenticated |
| `GET` | `/api/subscriptions/payments/pending` | List all pending payment requests (Paginated) | SuperAdmin Only |
| `PATCH` | `/api/subscriptions/payments/:id/approve` | Approve payment request & extend tier expiry | SuperAdmin Only |
| `PATCH` | `/api/subscriptions/payments/:id/reject` | Reject payment request with reason | SuperAdmin Only |

---

### 5. 📦 Inventory Catalog (Free Tier Limit: Max 5 Items)

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/items` | Add product item (Max 5 for Free Tier) | Authenticated |
| `GET` | `/api/items` | List shop products (Paginated, `?category=...`, `?search=...`) | Authenticated |
| `GET` | `/api/items/low-stock` | Get low stock warning products (Paginated) | Authenticated |
| `GET` | `/api/items/insights` | Get smart reorder quantity suggestions & dead stock alerts | Authenticated |
| `GET` | `/api/items/:id` | Get product details by ID | Authenticated |
| `PUT` | `/api/items/:id` | Update product details | Authenticated |
| `PATCH` | `/api/items/:id/stock` | Adjust stock quantity (+/- N) | Authenticated |
| `DELETE` | `/api/items/:id` | Delete product item (Moves to Recycle Bin) | Authenticated |
| `GET` | `/api/categories` | List product categories (Paginated) | Authenticated |
| `POST` | `/api/categories` | Create new product category | Authenticated |

---

### 6. 👥 Customers & Ledger Statements (Free Tier Limit: Max 1 Customer)

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/customers` | Register new customer (Max 1 for Free Tier) | Authenticated |
| `GET` | `/api/customers` | List shop customers & balances (Paginated, `?search=...`) | Authenticated |
| `GET` | `/api/customers/:id` | Get customer profile | Authenticated |
| `PUT` | `/api/customers/:id` | Update customer info | Permission: `canEditCustomers` |
| `DELETE` | `/api/customers/:id` | Delete customer (Moves to Recycle Bin) | Permission: `canEditCustomers` |
| `GET` | `/api/customers/:id/ledger` | Get transaction statement ledger (Paginated, `?startDate=...`, `?endDate=...`) | Authenticated |
| `GET` | `/api/customers/:id/due-reminder-link` | Generate WhatsApp direct chat link for due payment reminder | Authenticated |

---

### 7. 🛒 Sales & POS Checkout Billing (Free Tier Limit: Max 5 Sales)

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/sales` | Process POS checkout transaction (Max 5 for Free Tier) | Authenticated |
| `GET` | `/api/sales` | List invoices (Paginated, `?cashierId=...`, `?paymentStatus=...`, `?startDate=...`, `?endDate=...`) | Authenticated |
| `GET` | `/api/sales/invoice/:invoiceNumber` | Fetch invoice details by number | Authenticated |
| `GET` | `/api/sales/:id` | Get sale details by ID | Authenticated |
| `GET` | `/api/sales/:id/whatsapp-link` | Generate WhatsApp direct chat link for sales receipt | Authenticated |

---

### 8. 💵 Customer Due Payments & Collections

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/payments` | Process payment against customer due balance | Authenticated |
| `GET` | `/api/payments` | List customer payment collection history (Paginated, `?customerId=...`, `?paymentMethod=...`, `?startDate=...`, `?endDate=...`) | Authenticated |

---

### 9. 🔄 Restocking & Product Returns

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/returns` | Process product return & restock inventory | Permission: `canProcessReturn` |
| `GET` | `/api/returns` | List return transaction history (Paginated, `?startDate=...`, `?endDate=...`) | Authenticated |

---

### 10. ♻️ Recycle Bin & Data Recovery System

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/trash` | List soft-deleted items, customers, sales, and returns (Paginated, `?entityType=...`) | Authenticated |
| `POST` | `/api/trash/restore/:entityType/:id` | Restore soft-deleted record back to active tables | Authenticated |
| `DELETE` | `/api/trash/permanent/:entityType/:id` | Permanently hard-delete record from MongoDB | Shop Admin / SuperAdmin |

---

### 11. 📊 Dashboards & Analytics

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/dashboard/stats` | Get shop KPIs (Revenue, Profit, Due, Stock Warnings) | Authenticated |
| `GET` | `/api/dashboard/insights` | Get profit margins, top selling items, and top customer analytics | Authenticated |
| `GET` | `/api/dashboard/superadmin` | Get platform metrics (Shops count, Revenue, Pending Payments) | SuperAdmin Only |
| `GET` | `/api/reports/sales` | Detailed sales report with date range filters (Paginated) | Authenticated |

---

### 12. 📥 Bulk CSV Data Export

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/export/inventory` | Export inventory product list to CSV file | Authenticated |
| `GET` | `/api/export/customers` | Export customer list and due balances to CSV file | Authenticated |
| `GET` | `/api/export/sales` | Export sales invoices history to CSV file | Permission: `canExportExcel` |
| `GET` | `/api/export/ledger/:customerId` | Export single customer transaction ledger to CSV file | Authenticated |

---

## 💻 Tech Stack & Dependencies

- **Framework**: NestJS (v10)
- **Database**: MongoDB with Mongoose ODM (v8)
- **Security & Throttling**: `@nestjs/throttler` (20 req/min), Passport JWT, bcrypt password hashing
- **Validation**: `class-validator` & `class-transformer`
- **Documentation**: Swagger OpenAPI (`@nestjs/swagger`)
- **Frontend UI**: Responsive HTML5 + Glassmorphic Dark UI served statically.
