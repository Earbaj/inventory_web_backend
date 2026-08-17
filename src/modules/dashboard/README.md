# 📊 Dashboard & Reports Module Documentation (`src/modules/dashboard`)

## 📌 Module Overview
The **Dashboard & Reports Module** calculates shop business KPIs (Total Sales Revenue, Paid Cash Collected, Outstanding Dues, Estimated Net Profit, Low Stock Alert Counts), detailed sales reports with date range & cashier filters, and SuperAdmin platform metrics.

---

## 📁 File Structure & Creation Order

1. **`dashboard.service.ts`**: Business logic for aggregating metrics across Sales, Items, Customers, Users, and Subscription Payments.
2. **`dashboard.controller.ts`**: HTTP REST API routes exposing dashboard & report endpoints.
3. **`dashboard.service.spec.ts`**: Unit test suite for `DashboardService`.
4. **`dashboard.module.ts`**: NestJS module registering Sale, Item, Customer, User, and SubscriptionPayment schemas.

---

## 📄 File Roles & Method Breakdown

### 1. `dashboard.service.ts`
- **`getDashboardStats(user)`**:
  - Scopes all aggregations to `user.shopId` and active non-deleted documents (`isDeleted: { $ne: true }`).
  - Computes `totalSalesRevenue`, `totalPaidCollected`, `totalDueAmount`.
  - Calculates `netProfit`: Available for Admins or staff with `canViewBuyPrice` permission (`totalPrice - (buyPrice * quantity)`).
  - Counts `lowStockCount`: Products where `stockQuantity <= lowStockThreshold`.
  - Computes `totalCustomerDue`: Sum of customer negative closing balances.
- **`getSalesReport(user, startDate, endDate, cashierId)`**:
  - Filters sales invoices by `user.shopId`, date range (`$gte`, `$lte`), and `cashierId`.
  - Aggregates top 10 selling products by quantity and revenue.
- **`getSuperAdminDashboard(user)`**:
  - Enforces role check: Only SuperAdmin can access platform metrics.
  - Aggregates total registered shops, manager count, free tier vs premium tier shops count, count of pending subscription payment requests, total revenue collected from approved subscription payments, and platform-wide inventory/sales counts.

### 2. `dashboard.controller.ts`
- `GET /api/dashboard/stats` (Authenticated, gets shop KPIs)
- `GET /api/dashboard/superadmin` (SuperAdmin Only, gets platform metrics)
- `GET /api/reports/sales` (Authenticated, optional `?startDate=...`, `?endDate=...`, `?cashierId=...`)
