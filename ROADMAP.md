# 🗺️ Complete Step-by-Step Developer Roadmap: Building Keeper POS Backend

Welcome to the comprehensive, feature-wise developer roadmap for building the **Keeper POS Backend (NestJS + MongoDB)** from scratch! This roadmap is specially designed so that even a beginner developer can follow it step-by-step and build a production-grade multi-tenant SaaS backend.

---

## 📌 Table of Contents

1. [Phase 1: Project Setup & Environment Configuration](#phase-1-project-setup--environment-configuration)
2. [Phase 2: Database Schemas & Multi-Tenancy Design](#phase-2-database-schemas--multi-tenancy-design)
3. [Phase 3: Authentication, One-Time SuperAdmin Setup & Password Recovery](#phase-3-authentication-one-time-superadmin-setup--password-recovery)
4. [Phase 4: API Rate Limiting & Security](#phase-4-api-rate-limiting--security)
5. [Phase 5: Multi-Tenancy Data Isolation (`shopId`)](#phase-5-multi-tenancy-data-isolation-shopid)
6. [Phase 6: Free Tier Feature Limitations](#phase-6-free-tier-feature-limitations)
7. [Phase 7: Subscriptions & Manual bKash Payments](#phase-7-subscriptions--manual-bkash-payments)
8. [Phase 8: Soft-Delete, Recycle Bin Data Recovery & SuperAdmin Dashboard](#phase-8-soft-delete-recycle-bin-data-recovery--superadmin-dashboard)

---

## Phase 1: Project Setup & Environment Configuration

### Step 1.1: Install NestJS CLI
If NestJS CLI is not installed globally, run:
```bash
npm install -g @nestjs/cli
```

### Step 1.2: Generate New Project
Initialize project:
```bash
nest new keeper-pos-backend
cd keeper-pos-backend
```

### Step 1.3: Install Required Dependencies
Install NestJS Mongoose, JWT, Passport, Throttler, Swagger, and Validation packages:
```bash
npm i --save @nestjs/mongoose mongoose @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt @nestjs/throttler @nestjs/config @nestjs/serve-static @nestjs/swagger class-validator class-transformer
npm i --save-dev @types/bcrypt @types/passport-jwt
```

### Step 1.4: Environment File Setup (`.env`)
Create a `.env` file in the project root:
```env
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/keeper_pos
JWT_SECRET=keeper_pos_super_secret_jwt_key_2026
JWT_EXPIRES_IN=7d
THROTTLE_LIMIT=20
BKASH_MERCHANT_NUMBER=01700000000
NAGAD_MERCHANT_NUMBER=01700000000
```

---

## Phase 2: Database Schemas & Multi-Tenancy Design

Every document in a multi-tenant system must know which shop it belongs to (`shopId`) and whether it has been deleted (`isDeleted`).

### Step 2.1: User Schema (`src/modules/auth/schemas/user.schema.ts`)
- **Roles**: `superadmin` (Platform Owner), `admin` (Shop Owner), `manager` (Shop Staff).
- **Subscription Fields**: `subscriptionTier` (`'free'`, `'basic'`, `'premium'`), `subscriptionExpiresAt` (`Date`).
- **Multi-Tenancy Field**: `shopId` (`String` - for Admin it is their own `_id`, for Manager it is creator Admin's `_id`).
- **Password Reset Fields**: `resetPasswordCode` (`String`), `resetPasswordExpiresAt` (`Date`).

### Step 2.2: Entities Schema Pattern (Items, Customers, Sales, Returns)
Add these fields to all data models:
```typescript
@Prop({ required: true, type: String, index: true })
shopId: string;

@Prop({ required: true, type: Boolean, default: false, index: true })
isDeleted: boolean;

@Prop({ type: Date, default: null })
deletedAt: Date;

@Prop({ type: String, default: null })
deletedBy: string;
```

---

## Phase 3: Authentication, One-Time SuperAdmin Setup & Password Recovery

### Step 3.1: JWT Strategy Setup (`src/modules/auth/jwt.strategy.ts`)
Return full context in `validate(payload)`:
```typescript
return {
  uid: user._id.toString(),
  email: user.email,
  name: user.name,
  role: user.role,
  shopId: user.shopId || user._id.toString(),
  subscriptionTier: user.subscriptionTier || 'free',
  subscriptionExpiresAt: user.subscriptionExpiresAt || null,
  permissions: user.permissions,
};
```

### Step 3.2: One-Time SuperAdmin Setup API (`POST /api/auth/setup-superadmin`)
- Check `userModel.countDocuments({ role: 'superadmin' })`.
- If `> 0`, throw `403 Forbidden` (`SuperAdmin already exists`).
- Otherwise, create superadmin user with `role: 'superadmin'`, `shopId: null`, `subscriptionTier: 'premium'`.

### Step 3.3: Password Recovery OTP Flow
1. **Forgot Password (`POST /api/auth/forgot-password`)**:
   - Generate 6-digit random number: `Math.floor(100000 + Math.random() * 900000).toString()`.
   - Set expiry: `new Date(Date.now() + 15 * 60 * 1000)`.
   - Log code in dev console and return success message.
2. **Reset Password (`POST /api/auth/reset-password`)**:
   - Validate email, reset code, and expiration.
   - Update `passwordHash`, clear `resetPasswordCode` & `resetPasswordExpiresAt`.

---

## Phase 4: API Rate Limiting & Security

### Step 4.1: Register Throttler Module (`src/app.module.ts`)
```typescript
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: 60000, // 1 minute
      limit: 20,  // Max 20 requests per minute
    }]),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
```

---

## Phase 5: Multi-Tenancy Data Isolation (`shopId`)

### Step 5.1: Save Operation Scoping
When creating any record (Product, Customer, Sale, Return), assign `shopId: user.shopId`:
```typescript
const item = new this.itemModel({
  ...createItemDto,
  shopId: user.shopId,
  isDeleted: false,
});
await item.save();
```

### Step 5.2: Query Operation Scoping
When querying data, always include `{ shopId: user.shopId, isDeleted: { $ne: true } }`:
```typescript
const items = await this.itemModel.find({
  shopId: user.shopId,
  isDeleted: { $ne: true }
}).exec();
```

---

## Phase 6: Free Tier Feature Limitations

In service files, before creating new resources, check if `user.subscriptionTier === 'free'`:

1. **Customers Limit (Max 1)**:
   ```typescript
   if (user.subscriptionTier === 'free') {
     const count = await this.customerModel.countDocuments({ shopId: user.shopId, isDeleted: { $ne: true } });
     if (count >= 1) throw new BadRequestException('Free tier is limited to 1 customer only. Please upgrade to premium.');
   }
   ```
2. **Manager Account Limit (Max 1)**:
   ```typescript
   if (createUserDto.role === 'manager') {
     const count = await this.userModel.countDocuments({ role: 'manager', shopId: loggedInUser.shopId });
     if (loggedInUser.subscriptionTier === 'free' && count >= 1) throw new BadRequestException('Free tier is limited to 1 manager account only.');
   }
   ```
3. **Inventory Items Limit (Max 5)**:
   ```typescript
   if (user.subscriptionTier === 'free') {
     const count = await this.itemModel.countDocuments({ shopId: user.shopId, isDeleted: { $ne: true } });
     if (count >= 5) throw new BadRequestException('Free tier is limited to 5 inventory items only.');
   }
   ```
4. **Sales Limit (Max 5)**:
   ```typescript
   if (user.subscriptionTier === 'free') {
     const count = await this.saleModel.countDocuments({ shopId: user.shopId, isDeleted: { $ne: true } });
     if (count >= 5) throw new BadRequestException('Free tier is limited to 5 sales transactions only.');
   }
   ```

---

## Phase 7: Subscriptions & Manual bKash Payments

### Step 7.1: Package Catalog API (`GET /api/subscriptions/packages`)
Return package details:
- **Free Starter**: Price 0 BDT (1 Customer, 1 Manager, 5 Items, 5 Sales).
- **Premium Monthly**: Price 1,000 BDT (30 Days Unlimited).
- **Premium Yearly**: Price 10,000 BDT (365 Days Unlimited).

### Step 7.2: Submit Manual Payment Request (`POST /api/subscriptions/payments/manual`)
Shop Admin submits transaction details (`trxId`, `accountNo`, `amount`, `packageId`, `paymentMethod: 'manual_bkash'`). Saves with `status: 'pending'`.

### Step 7.3: SuperAdmin Payment Approval (`PATCH /api/subscriptions/payments/:id/approve`)
- SuperAdmin approves payment.
- Calculate expiration extension:
  - Add 30 days (`premium_monthly`) or 365 days (`premium_yearly`).
  - If existing `user.subscriptionExpiresAt > now`, add days to existing `subscriptionExpiresAt`; otherwise from `now`.
- Update `user.subscriptionTier = 'premium'` and set `subscriptionExpiresAt`.

---

## Phase 8: Soft-Delete, Recycle Bin Data Recovery & SuperAdmin Dashboard

### Step 8.1: Soft-Delete Implementation
In delete methods, set soft-delete flags instead of removing document:
```typescript
item.isDeleted = true;
item.deletedAt = new Date();
item.deletedBy = user.uid || user.id;
await item.save();
```

### Step 8.2: Recycle Bin APIs (`src/modules/trash/`)
- `GET /api/trash`: Lists all soft-deleted items, customers, sales, returns for `user.shopId`.
- `POST /api/trash/restore/:entityType/:id`: Restores document (`isDeleted: false`).
- `DELETE /api/trash/permanent/:entityType/:id`: Permanently purges document from MongoDB (`findOneAndDelete`).

### Step 8.3: SuperAdmin Platform Dashboard (`GET /api/dashboard/superadmin`)
Returns system-wide metrics:
- Total Shops (`role === 'admin'`) and Managers (`role === 'manager'`).
- Total revenue from approved subscription payments.
- Count of pending payment requests.
- Platform-wide total inventory items & sales counts.

---

## 🎯 Summary Checklist for Beginners

- [x] Step 1: Install Dependencies & Setup `.env`
- [x] Step 2: Define Schemas with `shopId` & `isDeleted`
- [x] Step 3: Implement Auth, One-Time SuperAdmin Setup & OTP Recovery
- [x] Step 4: Add `@nestjs/throttler` Rate Limiting (20 req/min)
- [x] Step 5: Scope all Database Operations by `shopId`
- [x] Step 6: Enforce Free Tier Feature Limits (1 Customer, 1 Manager, 5 Items, 5 Sales)
- [x] Step 7: Build Subscriptions & Manual bKash Payment Approval System
- [x] Step 8: Build Recycle Bin (Trash Restore/Hard-Delete) & SuperAdmin Dashboard
- [x] Step 9: Test & Verify (`npm run build`, `npm run seed`)
