# 📦 Inventory Module Documentation (`src/modules/inventory`)

## 📌 Module Overview
The **Inventory Module** handles product catalog CRUD operations, categories, stock quantity tracking, stock adjustments (+/- N), low stock warning alerts, soft-deletion, and multi-tenancy shop isolation (`shopId`).

---

## 📁 File Structure & Creation Order

1. **`schemas/item.schema.ts`**: MongoDB Product Item schema.
2. **`schemas/category.schema.ts`**: MongoDB Product Category schema.
3. **`dto/inventory.dto.ts`**: Input validation DTOs for items, categories, and stock adjustments.
4. **`inventory.service.ts`**: Business logic for inventory CRUD, low stock alerts, stock adjustment, soft-delete, and Free Tier limits.
5. **`inventory.controller.ts`**: HTTP REST API routes exposing inventory endpoints.
6. **`inventory.service.spec.ts`**: Unit test suite for `InventoryService`.
7. **`inventory.module.ts`**: NestJS module registering Item and Category schemas.

---

## 📄 File Roles & Method Breakdown

### 1. `item.schema.ts`
- `name`: Product name.
- `sku`: SKU or barcode code.
- `category`: Category name string.
- `sellPrice`: Retail selling price.
- `buyPrice`: Cost / purchase price.
- `stockQuantity`: Current stock in hand.
- `unit`: Measurement unit (e.g. `pcs`, `kg`, `rim`).
- `lowStockThreshold`: Low stock warning threshold limit (default `5`).
- `shopId`, `isDeleted`, `deletedAt`, `deletedBy`: Multi-tenancy & soft-delete fields.

### 2. `category.schema.ts`
- `name`: Category name.
- `description`: Description string.
- `shopId`, `isDeleted`, `deletedAt`, `deletedBy`: Multi-tenancy & soft-delete fields.

### 3. `inventory.dto.ts`
- `CreateItemDto`: `name`, `sku`, `category`, `sellPrice`, `buyPrice`, `stockQuantity`, `unit`, `lowStockThreshold`.
- `UpdateItemDto`: Optional fields for updating item details.
- `UpdateStockDto`: `adjustment` (+N to add, -N to deduct).
- `CreateCategoryDto`: `name`, `description`.

### 4. `inventory.service.ts`
- **`createItem(dto, user)`**: Creates a new inventory product item. Enforces Free Tier Limit: Maximum 5 Inventory Items per free tier shop.
- **`findAllItems(user, category)`**: Lists active items (`isDeleted: false`) for `user.shopId` (optionally filtered by `category`).
- **`findLowStockItems(user)`**: Returns products where `stockQuantity <= lowStockThreshold`.
- **`findOneItem(id, user)`**: Fetches single product item details by ID.
- **`updateItem(id, dto, user)`**: Updates item details (buy price can only be updated by Admin or user with `canViewBuyPrice` permission).
- **`updateStock(id, dto, user)`**: Adjusts item `stockQuantity` by adding or subtracting `adjustment`.
- **`removeItem(id, user)`**: Performs soft-delete (`isDeleted: true`). Moves item to Recycle Bin.
- **`createCategory(dto, user)`**: Creates a new product category for `user.shopId`.
- **`findAllCategories(user)`**: Lists all categories for `user.shopId`.
- **`formatItem(item, user)`**: Formats item response and masks `buyPrice` if user lacks permission.

### 5. `inventory.controller.ts`
- `POST /api/items` (Authenticated, Max 5 for Free Tier)
- `GET /api/items` (Authenticated, optional `?category=...`)
- `GET /api/items/low-stock` (Authenticated)
- `GET /api/items/:id` (Authenticated)
- `PUT /api/items/:id` (Authenticated)
- `PATCH /api/items/:id/stock` (Authenticated)
- `DELETE /api/items/:id` (Authenticated, soft-deletes)
- `GET /api/categories` (Authenticated)
- `POST /api/categories` (Authenticated)
