# ⚡ Keeper POS — NestJS & MongoDB Backend Service

Welcome to the backend API service for **Keeper POS**! Built with **NestJS**, **TypeScript**, and **MongoDB (Mongoose)**, this backend provides enterprise-grade Point of Sale billing, customer ledgers, inventory management, restocking returns, and financial analytics.

---

## 🚀 Key Features

- **🔐 JWT Authentication & RBAC**: Admin and Manager roles with granular permissions (`canProcessReturn`, `canExportExcel`, `canEditCustomers`, `canViewBuyPrice`).
- **📦 Inventory Catalog & Stock Alerts**: Product CRUD, category management, stock decrement on sales, stock restocking on returns, and low stock threshold warnings.
- **🛒 POS Checkout & Billing**: Atomic multi-item checkout, invoice generation (`INV-YYYYMMDD-XXXX`), line-item & global discounts, paid/due tracking.
- **👥 Customer Ledger Statements**: Customer directory, balance tracking (Positive = Advance, Negative = Due), payment collections, and detailed transaction ledger history (`sale`, `payment`, `return`, `opening`).
- **🔄 Restocking & Returns**: Return items by invoice number, restock inventory, recalculate invoice totals, update customer due/balance.
- **📊 Analytics & Dashboard**: Total sales revenue, estimated net profit, total outstanding customer dues, low stock counts, and sales reports.
- **🌐 Web UI Dashboard & Live Swagger API**: Built-in modern web dashboard served at `http://localhost:3000/` and interactive Swagger docs at `http://localhost:3000/api/docs`.

---

## 🛠️ Installation & Setup

### Prerequisites
- **Node.js**: v18+ 
- **MongoDB**: Installed locally or accessible via MongoDB Atlas URI.

### 1. Install Dependencies
Navigate into the `backend` folder and install dependencies:
```bash
cd backend
npm install
```

### 2. Environment Configuration
Create or modify the `.env` file in the `backend/` directory:
```env
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/keeper_pos
JWT_SECRET=keeper_pos_super_secret_jwt_key_2026
JWT_EXPIRES_IN=7d
```

### 3. Seed Initial Database
Seed default users, categories, products, and test customer into MongoDB:
```bash
npm run seed
```

**Default Accounts Created:**
- 🔑 **Super Admin**: `admin@shop.com` | Password: `admin123`
- 👤 **Manager**: `manager@shop.com` | Password: `admin123`

### 4. Start Server
Run in development mode with hot-reload:
```bash
npm run start:dev
```
Or build and run production mode:
```bash
npm run build
npm run start:prod
```

---

## 🌐 Web App & API Documentation Links

- **🖥️ Web Dashboard UI**: `http://localhost:3000/`
- **📜 Live Interactive Swagger API**: `http://localhost:3000/api/docs`

---

## 📖 API Endpoints Reference

> Note: All endpoints except `/api/auth/login` and `/api/auth/register` require a Bearer JWT Token in the Authorization header: `Authorization: Bearer <YOUR_JWT_TOKEN>`.

### 1. 🔐 Authentication & User Management

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Authenticate user & get JWT token | Public |
| `POST` | `/api/auth/register` | Register new admin account | Public |
| `GET` | `/api/auth/me` | Get current logged-in user profile | Authenticated |
| `GET` | `/api/users` | List all system users | Admin Only |
| `POST` | `/api/users` | Create manager or admin user | Admin Only |
| `PATCH` | `/api/users/:id/permissions` | Update manager permissions | Admin Only |
| `POST` | `/api/users/change-password` | Change user password | Authenticated |
| `DELETE` | `/api/users/:id` | Delete user account | Admin Only |

#### Sample Login Request:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@shop.com", "password": "admin123"}'
```

---

### 2. 📦 Inventory & Products

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/items` | Add new product item | Authenticated |
| `GET` | `/api/items` | List products (Optional `?category=Electronics`) | Authenticated |
| `GET` | `/api/items/low-stock` | Get products below low-stock threshold | Authenticated |
| `GET` | `/api/items/:id` | Get product details by ID | Authenticated |
| `PUT` | `/api/items/:id` | Update product details | Authenticated |
| `PATCH` | `/api/items/:id/stock` | Adjust stock quantity (`adjustment: +/-N`) | Authenticated |
| `DELETE` | `/api/items/:id` | Delete product item | Authenticated |
| `GET` | `/api/categories` | List all categories | Authenticated |
| `POST` | `/api/categories` | Create new category | Authenticated |

#### Sample Add Item Request:
```bash
curl -X POST http://localhost:3000/api/items \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Wireless Ergonomic Mouse",
    "sku": "SKU-1005",
    "category": "Electronics",
    "sellPrice": 550.00,
    "buyPrice": 380.00,
    "stockQuantity": 30,
    "unit": "pcs",
    "lowStockThreshold": 5
  }'
```

---

### 3. 👥 Customers & Ledger

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/customers` | Register new customer | Authenticated |
| `GET` | `/api/customers` | List all customers & balances | Authenticated |
| `GET` | `/api/customers/:id` | Get customer profile | Authenticated |
| `PUT` | `/api/customers/:id` | Update customer info | Permission: `canEditCustomers` |
| `DELETE` | `/api/customers/:id` | Delete customer | Permission: `canEditCustomers` |
| `GET` | `/api/customers/:id/ledger` | Get complete ledger statement | Authenticated |

---

### 4. 🛒 Sales & POS Checkout Billing

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/sales` | Process POS checkout transaction | Authenticated |
| `GET` | `/api/sales` | List invoices (`?cashierId=...`, `?paymentStatus=...`) | Authenticated |
| `GET` | `/api/sales/invoice/:invoiceNumber` | Fetch invoice details by number | Authenticated |
| `GET` | `/api/sales/:id` | Get sale details by ID | Authenticated |

#### Sample POS Checkout Request:
```bash
curl -X POST http://localhost:3000/api/sales \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "walk-in",
    "items": [
      {
        "itemId": "<ITEM_ID>",
        "quantity": 2,
        "unitPrice": 450.00,
        "discount": 0,
        "discountType": "amount"
      }
    ],
    "discount": 50.00,
    "paidAmount": 850.00
  }'
```

---

### 5. 💵 Payments & Due Collection

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/payments` | Process payment against customer due | Authenticated |

#### Sample Payment Request:
```bash
curl -X POST http://localhost:3000/api/payments \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "<CUSTOMER_ID>",
    "amount": 500.00,
    "paymentMethod": "bkash"
  }'
```

---

### 6. 🔄 Restocking & Product Returns

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/returns` | Process product return & restock | Permission: `canProcessReturn` |
| `GET` | `/api/returns` | List return transactions history | Authenticated |

---

### 7. 📊 Dashboard Analytics & Reports

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/dashboard/stats` | Get shop KPIs (Revenue, Profit, Due, Alerts) | Authenticated |
| `GET` | `/api/reports/sales` | Detailed sales report with date range filters | Authenticated |

---

## 🛠️ Technology Stack

- **Framework**: NestJS (v10)
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Passport JWT + bcrypt password hashing
- **Validation**: `class-validator` & `class-transformer`
- **Documentation**: Swagger OpenAPI (`@nestjs/swagger`)
- **Frontend UI**: HTML5, Vanilla JavaScript, Glassmorphism Dark CSS
