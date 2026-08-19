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

### 🔐 1. Authentication, SuperAdmin Setup & Profile Management

#### 1.1 `POST /api/auth/setup-superadmin`
- **Description**: Initial one-time SuperAdmin setup (Allowed ONLY IF zero SuperAdmins exist in MongoDB).
- **Access**: Public
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

#### 1.2 `POST /api/auth/login`
- **Description**: Authenticate user and receive Bearer JWT token.
- **Access**: Public
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

#### 1.3 `POST /api/auth/register`
- **Description**: Register a new Shop Owner (Admin) account with automatic `shopId` scoping.
- **Access**: Public
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

#### 1.4 `POST /api/auth/forgot-password`
- **Description**: Request 6-digit numeric password recovery OTP code sent to user email.
- **Access**: Public
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

#### 1.5 `POST /api/auth/reset-password`
- **Description**: Verify OTP code and set new user account password.
- **Access**: Public
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

#### 1.6 `GET /api/auth/me`
- **Description**: Get currently logged-in user profile, shop ID, and subscription details.
- **Access**: Authenticated (Bearer Token)
- **Response (200 OK)**:
  ```json
  {
    "uid": "65c1a2b3c4d5e6f7a8b9c0d0",
    "email": "admin@shop.com",
    "name": "Rahim Store Admin",
    "role": "admin",
    "shopId": "65c1a2b3c4d5e6f7a8b9c0d0",
    "subscriptionTier": "free"
  }
  ```

#### 1.7 `PUT /api/auth/profile`
- **Description**: Update profile details (name, phone, address, logoUrl) of logged-in user/shop.
- **Access**: Authenticated (Bearer Token)
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

#### 1.8 `GET /api/users`
- **Description**: List all shop users (Paginated).
- **Access**: Authenticated (Bearer Token)
- **Query Parameters**: `page=1`, `limit=10`, `search=kamal`, `sortBy=createdAt`, `sortOrder=desc`
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
        "subscriptionTier": "free",
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

#### 1.9 `POST /api/users`
- **Description**: Create new manager account for current shop (Max 1 for Free Tier).
- **Access**: Admin / SuperAdmin Only
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

#### 1.10 `PATCH /api/users/:id/permissions`
- **Description**: Update permissions for a specific manager account.
- **Access**: Admin / SuperAdmin Only
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

#### 1.11 `POST /api/users/change-password`
- **Description**: Change password for currently logged-in user.
- **Access**: Authenticated (Bearer Token)
- **Request Body**:
  ```json
  {
    "newPassword": "newsecretpassword123"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "message": "Password updated successfully"
  }
  ```

#### 1.12 `DELETE /api/users/:id`
- **Description**: Delete user account from current shop.
- **Access**: Admin / SuperAdmin Only
- **Response (200 OK)**:
  ```json
  {
    "message": "User deleted successfully"
  }
  ```

---

### 👥 2. Staff Management

#### 2.1 `GET /api/staff`
- **Description**: List staff members for current shop (Paginated).
- **Access**: Authenticated (Bearer Token)
- **Query Parameters**: `page=1`, `limit=10`, `search=kamal`
- **Response (200 OK)**:
  ```json
  {
    "data": [
      {
        "id": "65c1a2b3c4d5e6f7a8b9c0d9",
        "uid": "65c1a2b3c4d5e6f7a8b9c0d9",
        "email": "staff@shop.com",
        "name": "Jamal Cashier",
        "role": "manager",
        "shopId": "65c1a2b3c4d5e6f7a8b9c0d0",
        "permissions": {
          "canProcessReturn": false,
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

#### 2.2 `POST /api/staff`
- **Description**: Create new staff member account.
- **Access**: Admin / SuperAdmin Only
- **Request Body**:
  ```json
  {
    "name": "Jamal Cashier",
    "email": "staff@shop.com",
    "password": "staffpassword123",
    "role": "manager",
    "permissions": {
      "canProcessReturn": false,
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
    "email": "staff@shop.com",
    "name": "Jamal Cashier",
    "role": "manager",
    "shopId": "65c1a2b3c4d5e6f7a8b9c0d0",
    "permissions": {
      "canProcessReturn": false,
      "canExportExcel": false,
      "canEditCustomers": true,
      "canViewBuyPrice": false
    }
  }
  ```

#### 2.3 `GET /api/staff/:id`
- **Description**: Get single staff member profile details.
- **Access**: Authenticated (Bearer Token)
- **Response (200 OK)**:
  ```json
  {
    "id": "65c1a2b3c4d5e6f7a8b9c0d9",
    "uid": "65c1a2b3c4d5e6f7a8b9c0d9",
    "email": "staff@shop.com",
    "name": "Jamal Cashier",
    "role": "manager",
    "shopId": "65c1a2b3c4d5e6f7a8b9c0d0",
    "permissions": {
      "canProcessReturn": false,
      "canExportExcel": false,
      "canEditCustomers": true,
      "canViewBuyPrice": false
    }
  }
  ```

#### 2.4 `PATCH /api/staff/:id/permissions`
- **Description**: Update staff member permissions.
- **Access**: Admin / SuperAdmin Only
- **Request Body**:
  ```json
  {
    "permissions": {
      "canProcessReturn": true,
      "canExportExcel": true,
      "canEditCustomers": true,
      "canViewBuyPrice": false
    }
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "uid": "65c1a2b3c4d5e6f7a8b9c0d9",
    "email": "staff@shop.com",
    "name": "Jamal Cashier",
    "role": "manager",
    "permissions": {
      "canProcessReturn": true,
      "canExportExcel": true,
      "canEditCustomers": true,
      "canViewBuyPrice": false
    }
  }
  ```

#### 2.5 `DELETE /api/staff/:id`
- **Description**: Delete staff member account.
- **Access**: Admin / SuperAdmin Only
- **Response (200 OK)**:
  ```json
  {
    "message": "User deleted successfully"
  }
  ```

---

### 🏢 3. SuperAdmin Registered Shops Management

#### 3.1 `GET /api/admin/shops`
- **Description**: List registered shop accounts (Paginated).
- **Access**: SuperAdmin Only
- **Query Parameters**: `page=1`, `limit=10`, `subscriptionTier=free`, `search=rahim`
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

#### 3.2 `GET /api/admin/shops/:id`
- **Description**: Get single shop details and associated managers list.
- **Access**: SuperAdmin Only
- **Response (200 OK)**:
  ```json
  {
    "id": "65c1a2b3c4d5e6f7a8b9c0d0",
    "shopId": "65c1a2b3c4d5e6f7a8b9c0d0",
    "name": "Rahim Store Admin",
    "email": "admin@shop.com",
    "role": "admin",
    "subscriptionTier": "free",
    "subscriptionExpiresAt": null,
    "managers": [
      {
        "uid": "65c1a2b3c4d5e6f7a8b9c0d9",
        "name": "Jamal Cashier",
        "email": "staff@shop.com",
        "permissions": {
          "canProcessReturn": false,
          "canExportExcel": false,
          "canEditCustomers": true,
          "canViewBuyPrice": false
        }
      }
    ],
    "createdAt": "2026-08-15T10:00:00.000Z"
  }
  ```

---

### 💳 4. Subscriptions & Manual bKash Payments

#### 4.1 `GET /api/subscriptions/packages`
- **Description**: List available subscription packages & feature limits.
- **Access**: Public
- **Response (200 OK)**:
  ```json
  [
    {
      "id": "free",
      "name": "Free Starter Package",
      "price": 0,
      "durationDays": 0,
      "maxItems": 5,
      "maxSales": 5,
      "maxCustomers": 1,
      "maxManagers": 1
    },
    {
      "id": "premium_monthly",
      "name": "Premium Monthly Package",
      "price": 1000,
      "durationDays": 30,
      "maxItems": "UNLIMITED",
      "maxSales": "UNLIMITED",
      "maxCustomers": "UNLIMITED",
      "maxManagers": "UNLIMITED"
    }
  ]
  ```

#### 4.2 `GET /api/subscriptions/payment-info`
- **Description**: Get merchant bKash/Nagad number & payment instructions.
- **Access**: Public
- **Response (200 OK)**:
  ```json
  {
    "bkashMerchantNumber": "01700000000",
    "nagadMerchantNumber": "01700000000",
    "instructions": "Send exact package fee via bKash/Nagad Make Payment option, then submit TrxID."
  }
  ```

#### 4.3 `POST /api/subscriptions/payments/manual`
- **Description**: Submit manual payment request with TrxID.
- **Access**: Shop Admin
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

#### 4.4 `GET /api/subscriptions/payments/my`
- **Description**: Get shop's payment request history (Paginated).
- **Access**: Authenticated (Bearer Token)
- **Response (200 OK)**:
  ```json
  {
    "data": [
      {
        "id": "65c1a2b3c4d5e6f7a8b9c0p1",
        "packageId": "premium_monthly",
        "amount": 1000,
        "paymentMethod": "manual_bkash",
        "trxId": "BK88231920X",
        "status": "pending",
        "createdAt": "2026-08-19T12:00:00.000Z"
      }
    ],
    "meta": { "total": 1, "page": 1, "limit": 10, "totalPages": 1, "hasNextPage": false, "hasPrevPage": false }
  }
  ```

#### 4.5 `GET /api/subscriptions/payments/pending`
- **Description**: List all pending payment requests across platform.
- **Access**: SuperAdmin Only
- **Response (200 OK)**:
  ```json
  {
    "data": [
      {
        "id": "65c1a2b3c4d5e6f7a8b9c0p1",
        "shopId": "65c1a2b3c4d5e6f7a8b9c0d0",
        "packageId": "premium_monthly",
        "amount": 1000,
        "trxId": "BK88231920X",
        "status": "pending"
      }
    ]
  }
  ```

#### 4.6 `PATCH /api/subscriptions/payments/:id/approve`
- **Description**: Approve payment request & extend tier expiry.
- **Access**: SuperAdmin Only
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

#### 4.7 `PATCH /api/subscriptions/payments/:id/reject`
- **Description**: Reject payment request with reason.
- **Access**: SuperAdmin Only
- **Request Body**:
  ```json
  {
    "reason": "TrxID does not match merchant bKash statement"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "message": "Payment request rejected successfully.",
    "payment": {
      "id": "65c1a2b3c4d5e6f7a8b9c0p1",
      "status": "rejected",
      "rejectionReason": "TrxID does not match merchant bKash statement"
    }
  }
  ```

---

### 📦 5. Inventory Catalog & Products (Free Tier Limit: Max 5 Items)

#### 5.1 `POST /api/items`
- **Description**: Add product item (Max 5 for Free Tier).
- **Access**: Authenticated (Bearer Token)
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

#### 5.2 `GET /api/items`
- **Description**: List shop products (Paginated, `?category=...`, `?search=...`).
- **Access**: Authenticated (Bearer Token)
- **Response (200 OK)**:
  ```json
  {
    "data": [
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
    ],
    "meta": { "total": 1, "page": 1, "limit": 10, "totalPages": 1, "hasNextPage": false, "hasPrevPage": false }
  }
  ```

#### 5.3 `GET /api/items/low-stock`
- **Description**: Get low stock warning products (`stockQuantity <= lowStockThreshold`).
- **Access**: Authenticated (Bearer Token)
- **Response (200 OK)**:
  ```json
  {
    "data": [
      {
        "id": "65c1a2b3c4d5e6f7a8b9c0e2",
        "name": "USB Keyboard",
        "sku": "SKU-1002",
        "stockQuantity": 2,
        "lowStockThreshold": 5,
        "isLowStock": true
      }
    ]
  }
  ```

#### 5.4 `GET /api/items/insights`
- **Description**: Get smart reorder quantity suggestions & dead stock alerts.
- **Access**: Authenticated (Bearer Token)
- **Response (200 OK)**:
  ```json
  {
    "summary": {
      "totalItems": 15,
      "lowStockCount": 2,
      "outOfStockCount": 1,
      "totalInventoryValue": "45000.00"
    },
    "reorderSuggestions": [
      {
        "id": "65c1a2b3c4d5e6f7a8b9c0e2",
        "name": "USB Keyboard",
        "sku": "SKU-1002",
        "currentStock": 2,
        "lowStockThreshold": 5,
        "suggestedReorderQuantity": 10,
        "estimatedReorderCost": "3200.00"
      }
    ],
    "deadStockItems": []
  }
  ```

#### 5.5 `GET /api/items/:id`
- **Description**: Get product details by ID.
- **Access**: Authenticated (Bearer Token)
- **Response (200 OK)**:
  ```json
  {
    "id": "65c1a2b3c4d5e6f7a8b9c0e1",
    "name": "Wireless Mouse",
    "sku": "SKU-1001",
    "category": "Electronics",
    "sellPrice": "450",
    "buyPrice": "320",
    "stockQuantity": 50
  }
  ```

#### 5.6 `GET /api/items/:id/barcode`
- **Description**: Generate product barcode, QR code link & sticker HTML.
- **Access**: Authenticated (Bearer Token)
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

#### 5.7 `PUT /api/items/:id`
- **Description**: Update product details.
- **Access**: Authenticated (Bearer Token)
- **Request Body**:
  ```json
  {
    "name": "Wireless Mouse Ergonomic",
    "sellPrice": 480.00
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "id": "65c1a2b3c4d5e6f7a8b9c0e1",
    "name": "Wireless Mouse Ergonomic",
    "sellPrice": "480"
  }
  ```

#### 5.8 `PATCH /api/items/:id/stock`
- **Description**: Adjust stock quantity (+/- N).
- **Access**: Authenticated (Bearer Token)
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
    "stockQuantity": 60
  }
  ```

#### 5.9 `DELETE /api/items/:id`
- **Description**: Soft-delete product item (Moves to Recycle Bin).
- **Access**: Authenticated (Bearer Token)
- **Response (200 OK)**:
  ```json
  {
    "message": "Item moved to trash (Soft deleted). Can be restored from Recycle Bin."
  }
  ```

#### 5.10 `GET /api/categories`
- **Description**: List product categories (Paginated).
- **Access**: Authenticated (Bearer Token)
- **Response (200 OK)**:
  ```json
  {
    "data": [
      {
        "id": "65c1a2b3c4d5e6f7a8b9c0cat1",
        "name": "Electronics",
        "description": "Computer peripherals"
      }
    ]
  }
  ```

#### 5.11 `POST /api/categories`
- **Description**: Create new product category.
- **Access**: Authenticated (Bearer Token)
- **Request Body**:
  ```json
  {
    "name": "Electronics",
    "description": "Computer peripherals and hardware accessories"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "id": "65c1a2b3c4d5e6f7a8b9c0cat1",
    "name": "Electronics",
    "description": "Computer peripherals and hardware accessories"
  }
  ```

---

### 👥 6. Customers & Ledger Statements (Free Tier Limit: Max 1 Customer)

#### 6.1 `POST /api/customers`
- **Description**: Register new customer (Max 1 for Free Tier).
- **Access**: Authenticated (Bearer Token)
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

#### 6.2 `GET /api/customers`
- **Description**: List shop customers & balances (Paginated, `?search=...`).
- **Access**: Authenticated (Bearer Token)
- **Response (200 OK)**:
  ```json
  {
    "data": [
      {
        "id": "65c1a2b3c4d5e6f7a8b9c0c1",
        "name": "Rahim Traders",
        "phone": "01711000000",
        "closingBalance": "-500"
      }
    ]
  }
  ```

#### 6.3 `GET /api/customers/:id`
- **Description**: Get customer profile details.
- **Access**: Authenticated (Bearer Token)
- **Response (200 OK)**:
  ```json
  {
    "id": "65c1a2b3c4d5e6f7a8b9c0c1",
    "name": "Rahim Traders",
    "phone": "01711000000",
    "address": "Motijheel, Dhaka",
    "closingBalance": "-500"
  }
  ```

#### 6.4 `PUT /api/customers/:id`
- **Description**: Update customer info.
- **Access**: Permission `canEditCustomers`
- **Request Body**:
  ```json
  {
    "name": "Rahim Store Ltd",
    "phone": "01711000000",
    "address": "Dhanmondi, Dhaka"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "id": "65c1a2b3c4d5e6f7a8b9c0c1",
    "name": "Rahim Store Ltd"
  }
  ```

#### 6.5 `DELETE /api/customers/:id`
- **Description**: Delete customer (Moves to Recycle Bin).
- **Access**: Permission `canEditCustomers`
- **Response (200 OK)**:
  ```json
  {
    "message": "Customer moved to trash (Soft deleted). Can be restored from Recycle Bin."
  }
  ```

#### 6.6 `GET /api/customers/:id/ledger`
- **Description**: Get transaction statement ledger (Paginated, `?startDate=...`, `?endDate=...`).
- **Access**: Authenticated (Bearer Token)
- **Response (200 OK)**:
  ```json
  {
    "customer": { "id": "65c1...", "name": "Rahim Traders", "closingBalance": "-500" },
    "data": [
      {
        "id": "65c1...",
        "type": "sale",
        "description": "Invoice #INV-20260819-0001",
        "amount": -500,
        "previousBalance": 0,
        "newBalance": -500,
        "date": "2026-08-19T16:00:00.000Z"
      }
    ]
  }
  ```

#### 6.7 `GET /api/customers/:id/due-reminder-link`
- **Description**: Generate WhatsApp direct chat link for due payment reminder.
- **Access**: Authenticated (Bearer Token)
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

### 🛒 7. Sales & POS Checkout Billing (Free Tier Limit: Max 5 Sales)

#### 7.1 `POST /api/sales`
- **Description**: Process POS checkout transaction (Max 5 for Free Tier).
- **Access**: Authenticated (Bearer Token)
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

#### 7.2 `GET /api/sales`
- **Description**: List invoices (Paginated, `?cashierId=...`, `?paymentStatus=...`, `?startDate=...`, `?endDate=...`).
- **Access**: Authenticated (Bearer Token)
- **Response (200 OK)**:
  ```json
  {
    "data": [
      {
        "id": "65c1a2b3c4d5e6f7a8b9c0s1",
        "invoiceNumber": "INV-20260819-0001",
        "customerName": "Rahim Traders",
        "grandTotal": "790",
        "paidAmount": "700",
        "paymentStatus": "partial"
      }
    ]
  }
  ```

#### 7.3 `GET /api/sales/invoice/:invoiceNumber`
- **Description**: Fetch invoice details by invoice number (e.g. `INV-20260819-0001`).
- **Access**: Authenticated (Bearer Token)
- **Response (200 OK)**:
  ```json
  {
    "id": "65c1a2b3c4d5e6f7a8b9c0s1",
    "invoiceNumber": "INV-20260819-0001",
    "customerName": "Rahim Traders",
    "grandTotal": "790"
  }
  ```

#### 7.4 `GET /api/sales/invoice/:invoiceNumber/print`
- **Description**: Get printable 80mm/58mm POS thermal receipt HTML document.
- **Access**: Authenticated (Bearer Token)
- **Response (200 OK - `Content-Type: text/html`)**:
  ```html
  <!DOCTYPE html>
  <html>
  <head><title>Receipt INV-20260819-0001</title></head>
  <body onload="window.print()">...</body>
  </html>
  ```

#### 7.5 `GET /api/sales/:id`
- **Description**: Get sale details by ID.
- **Access**: Authenticated (Bearer Token)
- **Response (200 OK)**:
  ```json
  {
    "id": "65c1a2b3c4d5e6f7a8b9c0s1",
    "invoiceNumber": "INV-20260819-0001",
    "grandTotal": "790"
  }
  ```

#### 7.6 `GET /api/sales/:id/whatsapp-link`
- **Description**: Generate WhatsApp direct chat link for sales invoice receipt.
- **Access**: Authenticated (Bearer Token)
- **Response (200 OK)**:
  ```json
  {
    "invoiceNumber": "INV-20260819-0001",
    "customerPhone": "01711000000",
    "cleanPhone": "8801711000000",
    "whatsappUrl": "https://api.whatsapp.com/send?phone=8801711000000&text=..."
  }
  ```

---

### 💵 8. Customer Due Payments & Collections

#### 8.1 `POST /api/payments`
- **Description**: Process payment against customer due balance.
- **Access**: Authenticated (Bearer Token)
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

#### 8.2 `GET /api/payments`
- **Description**: List customer payment collection history (Paginated, `?customerId=...`, `?startDate=...`, `?endDate=...`).
- **Access**: Authenticated (Bearer Token)
- **Response (200 OK)**:
  ```json
  {
    "data": [
      {
        "id": "65c1a2b3c4d5e6f7a8b9c0p9",
        "customerName": "Rahim Traders",
        "amount": "90",
        "paymentMethod": "cash",
        "date": "2026-08-19T16:15:00.000Z"
      }
    ]
  }
  ```

---

### 🔄 9. Restocking & Product Returns

#### 9.1 `POST /api/returns`
- **Description**: Process product return & restock inventory (`refundMethod`: `cash`, `due_adjust`, `bkash`).
- **Access**: Permission `canProcessReturn`
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

#### 9.2 `GET /api/returns`
- **Description**: List return transaction history (Paginated, `?startDate=...`, `?endDate=...`).
- **Access**: Authenticated (Bearer Token)
- **Response (200 OK)**:
  ```json
  {
    "data": [
      {
        "id": "65c1a2b3c4d5e6f7a8b9c0r1",
        "saleId": "65c1a2b3c4d5e6f7a8b9c0s1",
        "totalRefundAmount": "405",
        "refundMethod": "due_adjust",
        "date": "2026-08-19T16:20:00.000Z"
      }
    ]
  }
  ```

---

### ♻️ 10. Recycle Bin & Data Recovery System

#### 10.1 `GET /api/trash`
- **Description**: List soft-deleted records (Paginated, `?entityType=item|customer|sale|return|expense`).
- **Access**: Authenticated (Bearer Token)
- **Response (200 OK)**:
  ```json
  {
    "data": [
      {
        "id": "65c1a2b3c4d5e6f7a8b9c0e1",
        "entityType": "item",
        "name": "Wireless Mouse",
        "deletedAt": "2026-08-19T16:00:00.000Z"
      }
    ]
  }
  ```

#### 10.2 `POST /api/trash/restore/:entityType/:id`
- **Description**: Restore soft-deleted record back to active database tables.
- **Access**: Authenticated (Bearer Token)
- **Response (200 OK)**:
  ```json
  {
    "message": "Record restored successfully from Recycle Bin",
    "entityType": "item",
    "id": "65c1a2b3c4d5e6f7a8b9c0e1"
  }
  ```

#### 10.3 `DELETE /api/trash/permanent/:entityType/:id`
- **Description**: Permanently hard-delete record from MongoDB storage.
- **Access**: Shop Admin / SuperAdmin Only
- **Response (200 OK)**:
  ```json
  {
    "message": "Record permanently purged from database"
  }
  ```

---

### 📊 11. Dashboards & Reports Analytics

#### 11.1 `GET /api/dashboard/stats`
- **Description**: Get shop KPIs (Revenue, Profit, Expenses, Due, Stock Warnings).
- **Access**: Authenticated (Bearer Token)
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

#### 11.2 `GET /api/dashboard/insights`
- **Description**: Get profit margins, top selling items, and top customer analytics.
- **Access**: Authenticated (Bearer Token)
- **Response (200 OK)**:
  ```json
  {
    "summary": {
      "totalSalesRevenue": "125000.00",
      "totalCost": "92000.00",
      "netProfit": "33000.00",
      "overallProfitMarginPercent": "26.40%"
    },
    "topSellingByQuantity": [
      { "name": "Wireless Mouse", "quantitySold": 45, "totalRevenue": "20250.00" }
    ],
    "topSellingByRevenue": [
      { "name": "Wireless Mouse", "quantitySold": 45, "totalRevenue": "20250.00" }
    ],
    "mostProfitableItems": [
      { "name": "Wireless Mouse", "totalProfit": "5850.00", "marginPercent": "28.89%" }
    ],
    "topCustomers": [
      { "id": "65c1...", "name": "Rahim Traders", "totalPurchased": "15000.00", "invoiceCount": 5, "dueBalance": "1500.00" }
    ]
  }
  ```

#### 11.3 `GET /api/dashboard/alerts`
- **Description**: Get aggregated active shop notifications & alerts.
- **Access**: Authenticated (Bearer Token)
- **Response (200 OK)**:
  ```json
  {
    "totalAlertsCount": 3,
    "lowStock": {
      "count": 2,
      "items": [
        { "id": "65c1...", "name": "Wireless Mouse", "sku": "SKU-1001", "stockQuantity": 2, "lowStockThreshold": 5, "severity": "WARNING" }
      ]
    },
    "customerDues": {
      "count": 1,
      "totalDueAmount": "1500.00",
      "customers": [
        { "id": "65c1...", "name": "Rahim Traders", "phone": "01711000000", "dueAmount": "1500.00" }
      ]
    },
    "subscription": null
  }
  ```

#### 11.4 `GET /api/dashboard/superadmin`
- **Description**: Get SuperAdmin platform overview metrics.
- **Access**: SuperAdmin Only
- **Response (200 OK)**:
  ```json
  {
    "totalRegisteredShops": 12,
    "totalManagersCount": 8,
    "freeTierShopsCount": 9,
    "premiumTierShopsCount": 3,
    "pendingPaymentRequestsCount": 1,
    "totalSubscriptionRevenue": "30000.00",
    "platformTotalItems": 350,
    "platformTotalSales": 1200
  }
  ```

#### 11.5 `GET /api/reports/sales`
- **Description**: Detailed sales report with date range filters (Paginated).
- **Access**: Authenticated (Bearer Token)
- **Query Parameters**: `startDate=2026-08-01`, `endDate=2026-08-19`, `cashierId=...`, `page=1`, `limit=10`
- **Response (200 OK)**:
  ```json
  {
    "totalRevenue": "125000.00",
    "totalDiscount": "2500.00",
    "totalInvoices": 85,
    "totalItemsSold": 320,
    "topSellingItems": [
      { "name": "Wireless Mouse", "quantity": 45, "revenue": "20250.00" }
    ],
    "salesList": {
      "data": [
        { "id": "65c1...", "invoiceNumber": "INV-20260819-0001", "grandTotal": "790.00", "paymentStatus": "partial" }
      ]
    }
  }
  ```

---

### 💸 12. Shop Expenses & Operational Overheads

#### 12.1 `POST /api/expenses`
- **Description**: Create new shop operational expense record (`rent`, `utility`, `salary`, `transport`, `misc`).
- **Access**: Authenticated (Bearer Token)
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

#### 12.2 `GET /api/expenses`
- **Description**: List shop expenses (Paginated, `?category=...`, `?startDate=...`, `?endDate=...`).
- **Access**: Authenticated (Bearer Token)
- **Response (200 OK)**:
  ```json
  {
    "data": [
      {
        "id": "65c1a2b3c4d5e6f7a8b9c0x1",
        "category": "utility",
        "title": "Shop Electricity Bill August",
        "amount": "1500",
        "date": "2026-08-19T00:00:00.000Z"
      }
    ],
    "totalExpenseAmount": "1500.00",
    "meta": { "total": 1, "page": 1, "limit": 10, "totalPages": 1, "hasNextPage": false, "hasPrevPage": false }
  }
  ```

#### 12.3 `GET /api/expenses/:id`
- **Description**: Get expense record details by ID.
- **Access**: Authenticated (Bearer Token)
- **Response (200 OK)**:
  ```json
  {
    "id": "65c1a2b3c4d5e6f7a8b9c0x1",
    "category": "utility",
    "title": "Shop Electricity Bill August",
    "amount": "1500"
  }
  ```

#### 12.4 `PUT /api/expenses/:id`
- **Description**: Update expense record.
- **Access**: Authenticated (Bearer Token)
- **Request Body**:
  ```json
  {
    "amount": 1600.00,
    "note": "Updated amount paid"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "id": "65c1a2b3c4d5e6f7a8b9c0x1",
    "amount": "1600"
  }
  ```

#### 12.5 `DELETE /api/expenses/:id`
- **Description**: Soft-delete expense record (Moves to Recycle Bin).
- **Access**: Authenticated (Bearer Token)
- **Response (200 OK)**:
  ```json
  {
    "message": "Expense record moved to trash (Soft deleted)."
  }
  ```

---

### 🤖 13. Gemini Flash AI Predictions & Intelligence

#### 13.1 `GET /api/ai/predict-demand`
- **Description**: AI-driven product demand forecasting and slow-moving risk prediction.
- **Access**: Authenticated (Bearer Token)
- **Response (200 OK)**:
  ```json
  {
    "isAiPowered": true,
    "modelUsed": "gemini-2.5-flash",
    "forecast": {
      "topTrendingProducts": [
        {
          "name": "Wireless Mouse",
          "reason": "High sales volume in the past 30 days and fast inventory turnover",
          "forecastedDemand": "HIGH"
        }
      ],
      "slowMovingRiskProducts": [
        {
          "name": "USB Keyboard Old Model",
          "reason": "Zero units sold in the last 30 days despite high stock count (20 pcs)",
          "riskLevel": "HIGH"
        }
      ],
      "aiReorderAdvice": "Reorder 30 pcs of Wireless Mouse before next week to avoid stockout. Consider running a 10% discount on USB Keyboard Old Model to clear dead stock."
    }
  }
  ```

#### 13.2 `GET /api/ai/customer-credit-score/:customerId`
- **Description**: AI customer reliability rating (1-100 score, credit risk level & max due limit).
- **Access**: Authenticated (Bearer Token)
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

#### 13.3 `GET /api/ai/business-advisor`
- **Description**: AI small business growth advisor, health grade & actionable profit tips.
- **Access**: Authenticated (Bearer Token)
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

### 📥 14. Bulk CSV Data Export

#### 14.1 `GET /api/export/inventory`
- **Description**: Export inventory product list to CSV file.
- **Access**: Authenticated (Bearer Token)
- **Headers**: `Content-Type: text/csv`, `Content-Disposition: attachment; filename="inventory_export.csv"`

#### 14.2 `GET /api/export/customers`
- **Description**: Export customer list and due balances to CSV file.
- **Access**: Authenticated (Bearer Token)
- **Headers**: `Content-Type: text/csv`, `Content-Disposition: attachment; filename="customers_export.csv"`

#### 14.3 `GET /api/export/sales`
- **Description**: Export sales invoices history to CSV file.
- **Access**: Permission `canExportExcel`
- **Headers**: `Content-Type: text/csv`, `Content-Disposition: attachment; filename="sales_export.csv"`

#### 14.4 `GET /api/export/ledger/:customerId`
- **Description**: Export single customer transaction ledger statement to CSV file.
- **Access**: Authenticated (Bearer Token)
- **Headers**: `Content-Type: text/csv`, `Content-Disposition: attachment; filename="customer_ledger_export.csv"`

---

### 🛡️ 15. System Health Check & Security Audit Logs

#### 15.1 `GET /api/health`
- **Description**: Health status, uptime, and DB connection state.
- **Access**: Public
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

#### 15.2 `GET /api/audit-logs`
- **Description**: List security audit trail logs (Paginated, `?startDate=...`, `?action=...`).
- **Access**: Admin / SuperAdmin Only
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
