# ♻️ Trash & Data Recovery Module Documentation (`src/modules/trash`)

## 📌 Module Overview
The **Trash & Data Recovery Module** powers the system's Recycle Bin functionality, allowing users to view soft-deleted records (Items, Customers, Sales, Returns), restore deleted items back into active database tables, and permanently purge selected records (Hard Delete).

---

## 📁 File Structure & Creation Order

1. **`trash.service.ts`**: Business logic for fetching soft-deleted items, restoring entities (`isDeleted = false`), and hard-deleting entities from MongoDB.
2. **`trash.controller.ts`**: HTTP REST API routes exposing recycle bin endpoints.
3. **`trash.service.spec.ts`**: Unit test suite for `TrashService`.
4. **`trash.module.ts`**: NestJS module registering Item, Customer, Sale, Return, and Ledger schemas.

---

## 📄 File Roles & Method Breakdown

### 1. `trash.service.ts`
- **`getTrashItems(user)`**:
  - Fetches all soft-deleted records (`isDeleted: true`) for `user.shopId` across 4 entities: Items, Customers, Sales, and Returns.
  - Returns formatted list separated by entity type with `deletedAt` and `deletedBy` metadata.
- **`restoreItem(entityType, id, user)`**:
  - Restores a soft-deleted record back to active tables by setting `isDeleted = false`, `deletedAt = null`, `deletedBy = null`.
  - Supports entityTypes: `'item'`, `'customer'`, `'sale'`, `'return'`.
  - When restoring a Customer, automatically restores associated Customer Ledger entries.
- **`permanentDelete(entityType, id, user)`**:
  - Enforces role permission: Only Shop Admins or SuperAdmin can perform permanent hard-deletes.
  - Calls Mongoose `findOneAndDelete` to permanently remove the document from MongoDB database storage.

### 2. `trash.controller.ts`
- `GET /api/trash` (Authenticated, lists Recycle Bin items)
- `POST /api/trash/restore/:entityType/:id` (Authenticated, restores soft-deleted item)
- `DELETE /api/trash/permanent/:entityType/:id` (Shop Admin Only, permanently purges item)
