# 🔐 Auth Module Documentation (`src/modules/auth`)

## 📌 Module Overview
The **Auth Module** handles user authentication, registration for Shop Owners (Admins), creation of Manager accounts with granular permissions, JWT token generation & validation, one-time initial SuperAdmin setup, and password recovery via 6-digit OTP code.

---

## 📁 File Structure & Creation Order

1. **`schemas/user.schema.ts`**: MongoDB User schema & Mongoose Document definitions.
2. **`dto/auth.dto.ts`**: Input validation DTOs with `class-validator` and Swagger decorators.
3. **`jwt.strategy.ts`**: Passport JWT authentication strategy for verifying Bearer tokens.
4. **`auth.service.ts`**: Core business logic for authentication, OTP code generation, password hashing, and user permissions.
5. **`auth.controller.ts`**: HTTP REST API routes exposing auth endpoints.
6. **`auth.service.spec.ts`**: Unit test suite for `AuthService`.
7. **`auth.module.ts`**: NestJS module registering user schema, JWT module, controllers, and providers.

---

## 📄 File Roles & Method Breakdown

### 1. `user.schema.ts`
Defines the `User` MongoDB collection schema:
- `email`: Unique email address.
- `passwordHash`: Bcrypt hashed password.
- `role`: Enum `['superadmin', 'admin', 'manager']`.
- `subscriptionTier`: Enum `['free', 'basic', 'premium']`.
- `subscriptionExpiresAt`: Expiration timestamp.
- `shopId`: Multi-tenancy identifier (`_id` of shop owner Admin).
- `resetPasswordCode`: 6-digit OTP code for password recovery.
- `resetPasswordExpiresAt`: OTP expiration timestamp (15 minutes).
- `permissions`: Manager permissions embedded object (`canProcessReturn`, `canExportExcel`, `canEditCustomers`, `canViewBuyPrice`).

### 2. `auth.dto.ts`
Contains input validation DTOs:
- `LoginDto`: `email`, `password`.
- `RegisterDto`: `name`, `email`, `password`, `role`.
- `CreateUserDto`: `name`, `email`, `password`, `role`, `permissions`.
- `SetupSuperAdminDto`: `name`, `email`, `password`.
- `ForgotPasswordDto`: `email`.
- `ResetPasswordDto`: `email`, `resetCode`, `newPassword`.
- `ChangePasswordDto`: `newPassword`.
- `UpdatePermissionsDto`: `permissions`.

### 3. `jwt.strategy.ts`
- **`validate(payload)`**: Extracts `sub` (user _id) from JWT token, fetches user profile from MongoDB, and attaches `req.user` context with `uid`, `email`, `role`, `shopId`, `subscriptionTier`, and `permissions`.

### 4. `auth.service.ts`
- **`setupSuperAdmin(dto)`**: One-time initial SuperAdmin setup. Checks if 0 SuperAdmins exist in database; creates SuperAdmin if 0, else throws `403 Forbidden`.
- **`forgotPassword(dto)`**: Generates a random 6-digit numeric OTP code valid for 15 minutes, stores code and expiration date in user document, and logs code in console.
- **`resetPassword(dto)`**: Verifies email, OTP code, and expiration timestamp. Hashes new password and clears reset fields upon success.
- **`login(dto)`**: Verifies email and password hash via `bcrypt.compare`. Returns signed JWT token and user profile.
- **`register(dto)`**: Creates a new Shop Owner (Admin). Automatically sets `shopId = savedUser._id.toString()` and sets default `subscriptionTier = 'free'`.
- **`createUser(dto, loggedInUser)`**: Allows Shop Admin to create a Manager account linked to `loggedInUser.shopId`. Enforces Free Tier Limit: Max 1 Manager account per free tier shop.
- **`getAllUsers(loggedInUser)`**: Lists shop users (scoped by `loggedInUser.shopId` for Admins, all users for SuperAdmin).
- **`updateUserPermissions(uid, permissions, loggedInUser)`**: Updates manager permissions.
- **`changePassword(uid, dto)`**: Hashes and updates user password.
- **`deleteUser(uid, loggedInUser)`**: Deletes user account from database.

### 5. `auth.controller.ts`
Exposes REST endpoints:
- `POST /api/auth/setup-superadmin` (Public, allowed once)
- `POST /api/auth/forgot-password` (Public)
- `POST /api/auth/reset-password` (Public)
- `POST /api/auth/login` (Public)
- `POST /api/auth/register` (Public)
- `GET /api/auth/me` (Authenticated)
- `GET /api/users` (Admin/SuperAdmin)
- `POST /api/users` (Admin/SuperAdmin)
- `PATCH /api/users/:id/permissions` (Admin/SuperAdmin)
- `POST /api/users/change-password` (Authenticated)
- `DELETE /api/users/:id` (Admin/SuperAdmin)
