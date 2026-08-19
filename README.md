# ⚡ Keeper POS — Multi-Tenant SaaS Backend (NestJS + MongoDB)

Welcome to the **Keeper POS Backend API Service**! Built with **NestJS**, **TypeScript**, and **MongoDB (Mongoose ODM)**, this enterprise-grade service provides Point of Sale billing, multi-tenancy shop isolation, API rate limiting, manual bKash subscription payments, soft-delete data recovery (Recycle Bin), password recovery OTP flow, staff management, health check diagnostics, module-wide data pagination, platform management for SuperAdmins, WhatsApp direct chat link generators, security activity audit logging, smart inventory forecasting, profit & top-seller analytics, bulk CSV data export, shop expense tracking, printable thermal receipts, barcode/QR generator, and Google Gemini Flash AI predictions.

---

## 🚀 Key Architectural & Enterprise Features

1. **🛡️ API Rate Limiting (`@nestjs/throttler`)**:
   - Prevents DoS attacks and API abuse using global rate-limiting guards (20 requests/minute per IP).
2. **🔑 Role-Based Access Control (RBAC) & Multi-Shop SaaS**:
   - **`superadmin`**: Platform owner (manages platform subscriptions, registered shops, approves/rejects manual payments, views global metrics).
   - **`admin`**: Shop Owner (manages own shop's items, customers, sales, staff/managers, expenses, and subscription tier).
   - **`manager`**: Shop Staff (created by Shop Admin, scoped to creator's `shopId` with granular permissions like `canProcessReturn`, `canExportExcel`, `canEditCustomers`, `canViewBuyPrice`).
3. **📄 Standardized Pagination & Search System**:
   - Universal `PaginationQueryDto` supporting `page` (default: 1), `limit` (default: 10, max: 100), `search`, `sortBy`, and `sortOrder` (`asc` / `desc`).
4. **📱 WhatsApp Direct Chat Link Generator**:
   - Generates instant zero-cost WhatsApp API message links for sending formatted sales receipts and customer due payment reminders (`/api/sales/:id/whatsapp-link` and `/api/customers/:id/due-reminder-link`).
5. **💸 Shop Expenses & Net Profit Accuracy**:
   - Tracks operational overheads (`rent`, `utility`, `salary`, `transport`, `misc`) and factors them into net profit calculation.
6. **🖨️ POS Thermal Receipt & Barcode Label Generator**:
   - Printable 80mm/58mm thermal cash receipt HTML (`/api/sales/invoice/:invoiceNumber/print`) and 50mm product barcode/QR sticker HTML (`/api/items/:id/barcode`).
7. **🤖 Gemini Flash AI Predictions Engine**:
   - AI-driven product demand forecasting (`/api/ai/predict-demand`), 1-100 customer credit scoring (`/api/ai/customer-credit-score/:customerId`), and business growth advice (`/api/ai/business-advisor`).
8. **📥 Bulk CSV Data Export**:
   - Allows shop owners to download structured CSV files for inventory, customers, sales, and customer ledger statements (`/api/export/*`).
9. **🛡️ Security Audit Logs & Activity Trail**:
   - Logs security actions (user creation, stock adjustments, permission updates, trash restores) with user ID, role, action, and timestamp (`GET /api/audit-logs`).
10. **♻️ Soft Delete & Recycle Bin / Data Recovery System**:
    - Critical data is soft-deleted (`isDeleted: true`), viewable in Recycle Bin (`GET /api/trash`), restorable, or permanently purgable.

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
GEMINI_API_KEY=your_google_gemini_api_key_here
```

### 3. Seed Database
```bash
npm run seed
```

**Default Accounts Created:**
- 👑 **Super Admin**: `superadmin@keeper.com` | Password: `superadmin123`
- 🔑 **Shop Admin**: `admin@shop.com` | Password: `admin123`
- 👤 **Manager**: `manager@shop.com` | Password: `admin123`

### 4. Start Server
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

## 📖 Complete Feature-Wise API Reference Guide

---

### 1. 🔐 Authentication, SuperAdmin Setup & Profile Management

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/setup-superadmin` | One-time initial SuperAdmin setup (Allowed only if 0 exist) | Public |
| `POST` | `/api/auth/login` | Login and receive Bearer JWT token | Public |
| `POST` | `/api/auth/register` | Register new Shop Owner (Admin) account | Public |
| `POST` | `/api/auth/forgot-password` | Request password reset 6-digit OTP code | Public |
| `POST` | `/api/auth/reset-password` | Reset password using OTP code | Public |
| `GET` | `/api/auth/me` | Get current logged-in user profile & subscription status | Authenticated |
| `PUT` | `/api/auth/profile` | Update profile details (name, phone, address, logoUrl) | Authenticated |
| `GET` | `/api/users` | List shop users (Paginated, `?search=...`) | Authenticated |
| `POST` | `/api/users` | Create new manager account (Max 1 for Free Tier) | Admin / SuperAdmin |
| `PATCH` | `/api/users/:id/permissions` | Update manager permissions | Admin / SuperAdmin |
| `POST` | `/api/users/change-password` | Change logged-in user password | Authenticated |
| `DELETE` | `/api/users/:id` | Delete user account | Admin / SuperAdmin |

#### 📥 Request & Response Payloads (Auth & Users)

- **`POST /api/auth/setup-superadmin`**
  - **Request Body**:
    ```json
    {
      "name": "Platform Super Admin",
      "email": "superadmin@keeper.com",
      "password": "supersecretpassword123"
    }
    ```
  - **Response (201 Created)**:
    ```json
    {
      "message": "SuperAdmin created successfully",
      "user": {
        "uid": "65c1a2b3c4d5e6f7a8b9c001",
        "email": "superadmin@keeper.com",
        "name": "Platform Super Admin",
        "role": "superadmin"
      }
    }
    ```

- **`POST /api/auth/login`**
  - **Request Body**:
    ```json
    {
      "email": "admin@shop.com",
      "password": "adminpassword123"
    }
    ```
  - **Response (200 OK)**:
    ```json
    {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "uid": "65c1a2b3c4d5e6f7a8b9c0d0",
        "email": "admin@shop.com",
        "name": "Rahim Store Admin",
        "role": "admin",
        "shopId": "65c1a2b3c4d5e6f7a8b9c0d0",
        "subscriptionTier": "free",
        "subscriptionExpiresAt": null,
        "permissions": {
          "canProcessReturn": true,
          "canExportExcel": true,
          "canEditCustomers": true,
          "canViewBuyPrice": true
        }
      }
    }
    ```

- **`POST /api/auth/register`**
  - **Request Body**:
    ```json
    {
      "name": "Rahim Store Admin",
      "email": "admin@shop.com",
      "password": "adminpassword123"
    }
    ```
  - **Response (201 Created)**:
    ```json
    {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "uid": "65c1a2b3c4d5e6f7a8b9c0d0",
        "email": "admin@shop.com",
        "name": "Rahim Store Admin",
        "role": "admin",
        "shopId": "65c1a2b3c4d5e6f7a8b9c0d0",
        "subscriptionTier": "free"
      }
    }
    ```

- **`POST /api/auth/forgot-password`**
  - **Request Body**:
    ```json
    {
      "email": "admin@shop.com"
    }
    ```
  - **Response (200 OK)**:
    ```json
    {
      "message": "Password recovery OTP code sent to your email (Valid for 15 minutes)",
      "email": "admin@shop.com"
    }
    ```

- **`POST /api/auth/reset-password`**
  - **Request Body**:
    ```json
    {
      "email": "admin@shop.com",
      "resetCode": "582910",
      "newPassword": "newsecurepassword123"
    }
    ```
  - **Response (200 OK)**:
    ```json
    {
      "message": "Password has been successfully reset. You can now login with your new password."
    }
    ```

- **`PUT /api/auth/profile`**
  - **Request Body**:
    ```json
    {
      "name": "Rahim Enterprise Ltd",
      "phone": "01711000000",
      "address": "Dhanmondi, Dhaka",
      "logoUrl": "https://example.com/shop-logo.png"
    }
    ```
  - **Response (200 OK)**:
    ```json
    {
      "uid": "65c1a2b3c4d5e6f7a8b9c0d0",
      "email": "admin@shop.com",
      "name": "Rahim Enterprise Ltd",
      "phone": "01711000000",
      "address": "Dhanmondi, Dhaka",
      "logoUrl": "https://example.com/shop-logo.png",
      "role": "admin",
      "shopId": "65c1a2b3c4d5e6f7a8b9c0d0"
    }
    ```

- **`POST /api/users`**
  - **Request Body**:
    ```json
    {
      "name": "Kamal Staff Manager",
      "email": "manager@shop.com",
      "password": "managerpassword123",
      "role": "manager",
      "permissions": {
        "canProcessReturn": true,
        "canExportExcel": false,
        "canEditCustomers": true,
        "canViewBuyPrice": false
      }
    }
    ```
  - **Response (201 Created)**:
    ```json
    {
      "uid": "65c1a2b3c4d5e6f7a8b9c0d9",
      "email": "manager@shop.com",
      "name": "Kamal Staff Manager",
      "role": "manager",
      "shopId": "65c1a2b3c4d5e6f7a8b9c0d0",
      "permissions": {
        "canProcessReturn": true,
        "canExportExcel": false,
        "canEditCustomers": true,
        "canViewBuyPrice": false
      }
    }
    ```

- **`PATCH /api/users/:id/permissions`**
  - **Request Body**:
    ```json
    {
      "permissions": {
        "canProcessReturn": true,
        "canExportExcel": true,
        "canEditCustomers": true,
        "canViewBuyPrice": true
      }
    }
    ```
  - **Response (200 OK)**:
    ```json
    {
      "uid": "65c1a2b3c4d5e6f7a8b9c0d9",
      "email": "manager@shop.com",
      "name": "Kamal Staff Manager",
      "role": "manager",
      "permissions": {
        "canProcessReturn": true,
        "canExportExcel": true,
        "canEditCustomers": true,
        "canViewBuyPrice": true
      }
    }
    ```

---

### 2. 👥 Staff Management

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/staff` | List staff members for current shop (Paginated, `?search=...`) | Authenticated |
| `POST` | `/api/staff` | Create new staff member account | Admin / SuperAdmin |
| `GET` | `/api/staff/:id` | Get single staff member details by ID | Authenticated |
| `PATCH` | `/api/staff/:id/permissions` | Update staff member permissions | Admin / SuperAdmin |
| `DELETE` | `/api/staff/:id` | Delete staff member account | Admin / SuperAdmin |

#### 📥 Request & Response Payloads (Staff)

- **`GET /api/staff`**
  - **Response (200 OK)**:
    ```json
    {
      "data": [
        {
          "id": "65c1a2b3c4d5e6f7a8b9c0d9",
          "uid": "65c1a2b3c4d5e6f7a8b9c0d9",
          "email": "manager@shop.com",
          "name": "Kamal Staff Manager",
          "role": "manager",
          "shopId": "65c1a2b3c4d5e6f7a8b9c0d0",
          "permissions": {
            "canProcessReturn": true,
            "canExportExcel": false,
            "canEditCustomers": true,
            "canViewBuyPrice": false
          }
        }
      ],
      "meta": {
        "total": 1,
        "page": 1,
        "limit": 10,
        "totalPages": 1,
        "hasNextPage": false,
        "hasPrevPage": false
      }
    }
    ```

---

### 3. 🏢 SuperAdmin Registered Shops Management

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/shops` | List registered shop accounts (Paginated, `?subscriptionTier=...`, `?search=...`) | SuperAdmin Only |
| `GET` | `/api/admin/shops/:id` | Get single shop details and associated managers list | SuperAdmin Only |

#### 📥 Response Payloads (Shops Management)

- **`GET /api/admin/shops`**
  - **Response (200 OK)**:
    ```json
    {
      "data": [
        {
          "id": "65c1a2b3c4d5e6f7a8b9c0d0",
          "shopId": "65c1a2b3c4d5e6f7a8b9c0d0",
          "name": "Rahim Store Admin",
          "email": "admin@shop.com",
          "role": "admin",
          "subscriptionTier": "free",
          "subscriptionExpiresAt": null,
          "managerCount": 1,
          "createdAt": "2026-08-15T10:00:00.000Z"
        }
      ],
      "meta": {
        "total": 1,
        "page": 1,
        "limit": 10,
        "totalPages": 1,
        "hasNextPage": false,
        "hasPrevPage": false
      }
    }
    ```

---

### 4. 💳 Subscriptions & Manual bKash Payments

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/subscriptions/packages` | List available subscription packages & limits | Public |
| `GET` | `/api/subscriptions/payment-info` | Get merchant bKash/Nagad number & payment instructions | Public |
| `POST` | `/api/subscriptions/payments/manual` | Submit manual payment request with TrxID | Shop Admin |
| `GET` | `/api/subscriptions/payments/my` | Get shop's payment request history (Paginated) | Authenticated |
| `GET` | `/api/subscriptions/payments/pending` | List all pending payment requests (Paginated) | SuperAdmin Only |
| `PATCH` | `/api/subscriptions/payments/:id/approve` | Approve payment request & extend tier expiry | SuperAdmin Only |
| `PATCH` | `/api/subscriptions/payments/:id/reject` | Reject payment request with reason | SuperAdmin Only |

#### 📥 Request & Response Payloads (Subscriptions)

- **`POST /api/subscriptions/payments/manual`**
  - **Request Body**:
    ```json
    {
      "packageId": "premium_monthly",
      "amount": 1000,
      "paymentMethod": "manual_bkash",
      "trxId": "BK88231920X",
      "accountNo": "01711223344"
    }
    ```
  - **Response (201 Created)**:
    ```json
    {
      "id": "65c1a2b3c4d5e6f7a8b9c0p1",
      "shopId": "65c1a2b3c4d5e6f7a8b9c0d0",
      "packageId": "premium_monthly",
      "amount": 1000,
      "paymentMethod": "manual_bkash",
      "trxId": "BK88231920X",
      "accountNo": "01711223344",
      "status": "pending",
      "createdAt": "2026-08-19T12:00:00.000Z"
    }
    ```

- **`PATCH /api/subscriptions/payments/:id/approve`**
  - **Response (200 OK)**:
    ```json
    {
      "message": "Payment approved successfully. Shop subscription upgraded to premium.",
      "payment": {
        "id": "65c1a2b3c4d5e6f7a8b9c0p1",
        "status": "approved"
      },
      "newExpiryDate": "2026-09-18T12:00:00.000Z"
    }
    ```

---

### 5. 📦 Inventory Catalog & Products (Free Tier Limit: Max 5 Items)

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/items` | Add product item (Max 5 for Free Tier) | Authenticated |
| `GET` | `/api/items` | List shop products (Paginated, `?category=...`, `?search=...`) | Authenticated |
| `GET` | `/api/items/low-stock` | Get low stock warning products (Paginated) | Authenticated |
| `GET` | `/api/items/insights` | Get smart reorder quantity suggestions & dead stock alerts | Authenticated |
| `GET` | `/api/items/:id` | Get product details by ID | Authenticated |
| `GET` | `/api/items/:id/barcode` | Generate product barcode, QR code link & sticker HTML | Authenticated |
| `PUT` | `/api/items/:id` | Update product details | Authenticated |
| `PATCH` | `/api/items/:id/stock` | Adjust stock quantity (+/- N) | Authenticated |
| `DELETE` | `/api/items/:id` | Delete product item (Moves to Recycle Bin) | Authenticated |
| `GET` | `/api/categories` | List product categories (Paginated) | Authenticated |
| `POST` | `/api/categories` | Create new product category | Authenticated |

#### 📥 Request & Response Payloads (Inventory)

- **`POST /api/items`**
  - **Request Body**:
    ```json
    {
      "name": "Wireless Mouse",
      "sku": "SKU-1001",
      "category": "Electronics",
      "sellPrice": 450.00,
      "buyPrice": 320.00,
      "stockQuantity": 50,
      "unit": "pcs",
      "lowStockThreshold": 5
    }
    ```
  - **Response (201 Created)**:
    ```json
    {
      "id": "65c1a2b3c4d5e6f7a8b9c0e1",
      "name": "Wireless Mouse",
      "sku": "SKU-1001",
      "category": "Electronics",
      "sellPrice": "450",
      "buyPrice": "320",
      "stockQuantity": 50,
      "unit": "pcs",
      "lowStockThreshold": 5,
      "isLowStock": false
    }
    ```

- **`GET /api/items/:id/barcode`**
  - **Response (200 OK)**:
    ```json
    {
      "itemId": "65c1a2b3c4d5e6f7a8b9c0e1",
      "name": "Wireless Mouse",
      "sku": "SKU-1001",
      "category": "Electronics",
      "sellPrice": "450",
      "qrCodeUrl": "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=SKU-1001",
      "barcodeText": "*SKU-1001*",
      "printableHtml": "<!DOCTYPE html><html>...</html>"
    }
    ```

- **`PATCH /api/items/:id/stock`**
  - **Request Body**:
    ```json
    {
      "adjustment": 10
    }
    ```
  - **Response (200 OK)**:
    ```json
    {
      "id": "65c1a2b3c4d5e6f7a8b9c0e1",
      "name": "Wireless Mouse",
      "stockQuantity": 60
    }
    ```

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

#### 📥 Request & Response Payloads (Customers & Ledger)

- **`POST /api/customers`**
  - **Request Body**:
    ```json
    {
      "name": "Rahim Traders",
      "phone": "01711000000",
      "address": "Motijheel, Dhaka",
      "openingBalance": 100.00
    }
    ```
  - **Response (201 Created)**:
    ```json
    {
      "id": "65c1a2b3c4d5e6f7a8b9c0c1",
      "name": "Rahim Traders",
      "phone": "01711000000",
      "address": "Motijheel, Dhaka",
      "openingBalance": "100",
      "closingBalance": "100"
    }
    ```

- **`GET /api/customers/:id/due-reminder-link`**
  - **Response (200 OK)**:
    ```json
    {
      "customerId": "65c1a2b3c4d5e6f7a8b9c0c1",
      "customerName": "Rahim Traders",
      "dueAmount": "500.00",
      "whatsappUrl": "https://api.whatsapp.com/send?phone=8801711000000&text=..."
    }
    ```

---

### 7. 🛒 Sales & POS Checkout Billing (Free Tier Limit: Max 5 Sales)

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/sales` | Process POS checkout transaction (Max 5 for Free Tier) | Authenticated |
| `GET` | `/api/sales` | List invoices (Paginated, `?cashierId=...`, `?paymentStatus=...`, `?startDate=...`, `?endDate=...`) | Authenticated |
| `GET` | `/api/sales/invoice/:invoiceNumber` | Fetch invoice details by invoice number | Authenticated |
| `GET` | `/api/sales/invoice/:invoiceNumber/print` | Get printable 80mm POS thermal receipt HTML | Authenticated |
| `GET` | `/api/sales/:id` | Get sale details by ID | Authenticated |
| `GET` | `/api/sales/:id/whatsapp-link` | Generate WhatsApp direct chat link for sales receipt | Authenticated |

#### 📥 Request & Response Payloads (Sales & POS Billing)

- **`POST /api/sales`**
  - **Request Body**:
    ```json
    {
      "customerId": "65c1a2b3c4d5e6f7a8b9c0c1",
      "customerName": "Rahim Traders",
      "customerPhone": "01711000000",
      "items": [
        {
          "itemId": "65c1a2b3c4d5e6f7a8b9c0e1",
          "quantity": 2,
          "unitPrice": 450.00,
          "discount": 10.00,
          "discountType": "percent"
        }
      ],
      "discount": 20.00,
      "paidAmount": 700.00
    }
    ```
  - **Response (201 Created)**:
    ```json
    {
      "id": "65c1a2b3c4d5e6f7a8b9c0s1",
      "invoiceNumber": "INV-20260819-0001",
      "customerName": "Rahim Traders",
      "subtotal": "810",
      "discount": "20",
      "grandTotal": "790",
      "paidAmount": "700",
      "dueAmount": "90",
      "paymentStatus": "partial",
      "date": "2026-08-19T16:00:00.000Z"
    }
    ```

---

### 8. 💵 Customer Due Payments & Collections

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/payments` | Process payment against customer due balance | Authenticated |
| `GET` | `/api/payments` | List customer payment collection history (Paginated, `?customerId=...`, `?startDate=...`, `?endDate=...`) | Authenticated |

#### 📥 Request & Response Payloads (Due Payments)

- **`POST /api/payments`**
  - **Request Body**:
    ```json
    {
      "customerId": "65c1a2b3c4d5e6f7a8b9c0c1",
      "amount": 90.00,
      "paymentMethod": "cash",
      "note": "Clear remaining invoice due balance"
    }
    ```
  - **Response (201 Created)**:
    ```json
    {
      "id": "65c1a2b3c4d5e6f7a8b9c0p9",
      "customerId": "65c1a2b3c4d5e6f7a8b9c0c1",
      "amount": "90",
      "paymentMethod": "cash",
      "previousBalance": "-90",
      "newBalance": "0"
    }
    ```

---

### 9. 🔄 Restocking & Product Returns

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/returns` | Process product return & restock inventory | Permission: `canProcessReturn` |
| `GET` | `/api/returns` | List return transaction history (Paginated, `?startDate=...`, `?endDate=...`) | Authenticated |

#### 📥 Request & Response Payloads (Returns & Restocking)

- **`POST /api/returns`**
  - **Request Body**:
    ```json
    {
      "customerId": "65c1a2b3c4d5e6f7a8b9c0c1",
      "saleId": "65c1a2b3c4d5e6f7a8b9c0s1",
      "returnedItems": [
        {
          "itemId": "65c1a2b3c4d5e6f7a8b9c0e1",
          "quantity": 1
        }
      ],
      "refundMethod": "due_adjust"
    }
    ```
  - **Response (201 Created)**:
    ```json
    {
      "id": "65c1a2b3c4d5e6f7a8b9c0r1",
      "saleId": "65c1a2b3c4d5e6f7a8b9c0s1",
      "totalRefundAmount": "405",
      "refundMethod": "due_adjust"
    }
    ```

---

### 10. ♻️ Recycle Bin & Data Recovery System

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/trash` | List soft-deleted records (Paginated, `?entityType=...`) | Authenticated |
| `POST` | `/api/trash/restore/:entityType/:id` | Restore soft-deleted record back to active tables | Authenticated |
| `DELETE` | `/api/trash/permanent/:entityType/:id` | Permanently hard-delete record from MongoDB | Shop Admin / SuperAdmin |

---

### 11. 📊 Dashboards & Reports Analytics

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/dashboard/stats` | Get shop KPIs (Revenue, Profit, Expenses, Due, Stock Warnings) | Authenticated |
| `GET` | `/api/dashboard/insights` | Get profit margins, top selling items, and top customer analytics | Authenticated |
| `GET` | `/api/dashboard/alerts` | Get aggregated active shop notifications (low stock, customer dues, subscription expiry) | Authenticated |
| `GET` | `/api/dashboard/superadmin` | Get platform metrics (Shops count, Revenue, Pending Payments) | SuperAdmin Only |
| `GET` | `/api/reports/sales` | Detailed sales report with date range filters (Paginated) | Authenticated |

#### 📥 Response Payloads (Dashboards)

- **`GET /api/dashboard/stats`**
  - **Response (200 OK)**:
    ```json
    {
      "totalSalesRevenue": "125000.00",
      "totalPaidCollected": "110000.00",
      "totalDueAmount": "15000.00",
      "totalExpenses": "4500.00",
      "netProfit": "28500.00",
      "totalItemsCount": 42,
      "lowStockCount": 3,
      "totalCustomersCount": 18,
      "totalCustomerDue": "15000.00",
      "totalInvoicesCount": 85
    }
    ```

- **`GET /api/dashboard/alerts`**
  - **Response (200 OK)**:
    ```json
    {
      "totalAlertsCount": 4,
      "lowStock": {
        "count": 2,
        "items": [
          { "id": "65c1...", "name": "Wireless Mouse", "sku": "SKU-1001", "stockQuantity": 2, "lowStockThreshold": 5, "severity": "WARNING" }
        ]
      },
      "customerDues": {
        "count": 2,
        "totalDueAmount": "3500.00",
        "customers": [
          { "id": "65c2...", "name": "Rahim Traders", "phone": "01711000000", "dueAmount": "2000.00" }
        ]
      },
      "subscription": null
    }
    ```

---

### 12. 💸 Shop Expenses & Operational Overheads

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/expenses` | Create new shop operational expense record (rent, utility, salary, transport) | Authenticated |
| `GET` | `/api/expenses` | List shop expenses (Paginated, `?category=...`, `?startDate=...`, `?endDate=...`) | Authenticated |
| `GET` | `/api/expenses/:id` | Get expense record details by ID | Authenticated |
| `PUT` | `/api/expenses/:id` | Update expense details | Authenticated |
| `DELETE` | `/api/expenses/:id` | Soft-delete expense record (Moves to Recycle Bin) | Authenticated |

#### 📥 Request & Response Payloads (Expenses)

- **`POST /api/expenses`**
  - **Request Body**:
    ```json
    {
      "category": "utility",
      "title": "Shop Electricity Bill August",
      "amount": 1500.00,
      "date": "2026-08-19",
      "note": "Paid via bKash Merchant"
    }
    ```
  - **Response (201 Created)**:
    ```json
    {
      "id": "65c1a2b3c4d5e6f7a8b9c0x1",
      "category": "utility",
      "title": "Shop Electricity Bill August",
      "amount": "1500",
      "date": "2026-08-19T00:00:00.000Z",
      "note": "Paid via bKash Merchant"
    }
    ```

---

### 13. 🤖 Gemini Flash AI Predictions & Intelligence

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/ai/predict-demand` | AI-driven product demand forecasting and slow-moving risk prediction | Authenticated |
| `GET` | `/api/ai/customer-credit-score/:customerId` | AI customer reliability rating (1-100 score, credit risk level & max due limit) | Authenticated |
| `GET` | `/api/ai/business-advisor` | AI small business growth advisor, health grade & actionable profit tips | Authenticated |

#### 📤 Response Payloads (Gemini AI)

- **`GET /api/ai/predict-demand`**
  - **Response (200 OK)**:
    ```json
    {
      "isAiPowered": true,
      "modelUsed": "gemini-2.5-flash",
      "forecast": {
        "topTrendingProducts": [
          { "name": "Wireless Mouse", "reason": "High sales volume in the past 30 days and fast inventory turnover", "forecastedDemand": "HIGH" }
        ],
        "slowMovingRiskProducts": [
          { "name": "USB Keyboard Old Model", "reason": "Zero units sold in the last 30 days despite high stock count (20 pcs)", "riskLevel": "HIGH" }
        ],
        "aiReorderAdvice": "Reorder 30 pcs of Wireless Mouse before next week to avoid stockout. Consider running a 10% discount on USB Keyboard Old Model to clear dead stock."
      }
    }
    ```

- **`GET /api/ai/customer-credit-score/:customerId`**
  - **Response (200 OK)**:
    ```json
    {
      "customerId": "65c1a2b3c4d5e6f7a8b9c0c1",
      "customerName": "Rahim Traders",
      "isAiPowered": true,
      "modelUsed": "gemini-2.5-flash",
      "assessment": {
        "reliabilityScore": 88,
        "creditRiskLevel": "LOW_RISK",
        "maxRecommendedDueLimit": 8000,
        "aiSummary": "Rahim Traders clears outstanding due balances within 14 days on average. Consistent payment history with minimal overdue risk."
      }
    }
    ```

- **`GET /api/ai/business-advisor`**
  - **Response (200 OK)**:
    ```json
    {
      "isAiPowered": true,
      "modelUsed": "gemini-2.5-flash",
      "advice": {
        "healthGrade": "A",
        "growthOpportunities": [
          "Collect 3,500 BDT in outstanding due balances using WhatsApp direct payment reminders to optimize cash flow.",
          "Expand stock for Electronics category which generates 65% of your shop net profit.",
          "Consider upgrading to Premium yearly subscription to unlock unlimited manager accounts and customer profiles."
        ],
        "actionableTips": [
          "Send WhatsApp payment reminders to top 3 customers with due balances over 1,000 BDT this week.",
          "Review smart reorder recommendations every Monday morning."
        ]
      }
    }
    ```

---

### 14. 📥 Bulk CSV Data Export

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/export/inventory` | Export inventory product list to CSV file | Authenticated |
| `GET` | `/api/export/customers` | Export customer list and due balances to CSV file | Authenticated |
| `GET` | `/api/export/sales` | Export sales invoices history to CSV file | Permission: `canExportExcel` |
| `GET` | `/api/export/ledger/:customerId` | Export single customer transaction ledger to CSV file | Authenticated |

---

### 15. 🛡️ System Health Check & Security Audit Logs

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Health status, uptime, and DB connection state | Public |
| `GET` | `/api/audit-logs` | List security audit trail logs (Paginated, `?startDate=...`, `?action=...`) | Admin / SuperAdmin |

#### 📤 Response Payloads (Health & Audit Logs)

- **`GET /api/health`**
  - **Response (200 OK)**:
    ```json
    {
      "status": "OK",
      "service": "Keeper POS Backend API",
      "version": "1.0.0",
      "uptime": 3600.42,
      "timestamp": "2026-08-19T17:00:00.000Z",
      "environment": "development",
      "database": {
        "status": "CONNECTED",
        "databaseName": "keeper_pos"
      }
    }
    ```

- **`GET /api/audit-logs`**
  - **Response (200 OK)**:
    ```json
    {
      "data": [
        {
          "id": "65c1a2b3c4d5e6f7a8b9c0a1",
          "shopId": "65c1a2b3c4d5e6f7a8b9c0d0",
          "userId": "65c1a2b3c4d5e6f7a8b9c0d0",
          "userName": "Rahim Store Admin",
          "userRole": "admin",
          "action": "CREATE_EXPENSE",
          "entityType": "expense",
          "entityId": "65c1a2b3c4d5e6f7a8b9c0x1",
          "details": { "title": "Shop Electricity Bill August", "amount": 1500 },
          "date": "2026-08-19T16:40:00.000Z"
        }
      ],
      "meta": {
        "total": 1,
        "page": 1,
        "limit": 10,
        "totalPages": 1,
        "hasNextPage": false,
        "hasPrevPage": false
      }
    }
    ```

---

## 💻 Tech Stack & Dependencies

- **Framework**: NestJS (v10)
- **Database**: MongoDB with Mongoose ODM (v8)
- **Security & Throttling**: `@nestjs/throttler` (20 req/min), Passport JWT, bcrypt password hashing
- **AI Integration**: Google Gemini Flash API (`gemini-2.5-flash`)
- **Validation**: `class-validator` & `class-transformer`
- **Documentation**: Swagger OpenAPI (`@nestjs/swagger`)
- **Frontend UI**: Responsive HTML5 + Glassmorphic Dark UI served statically.
