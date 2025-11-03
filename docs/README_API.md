# Backend ERP API

Backend API untuk sistem ERP (Enterprise Resource Planning) menggunakan NestJS, TypeORM, dan PostgreSQL.

## Fitur

1. ✅ **Setup Migration** - Migrasi database dengan TypeORM
2. ✅ **API Login** - Autentikasi dengan JWT
3. ✅ **API Register** - Registrasi user baru
4. ✅ **Guard Login** - JWT Auth Guard, Roles Guard, Permissions Guard
5. ✅ **API Role** - CRUD untuk manajemen role
6. ✅ **API Permission** - CRUD untuk manajemen permission
7. ✅ **API Profile** - Endpoint untuk mendapatkan profile user
8. ✅ **API Master Branch** - CRUD untuk master data cabang
9. ✅ **API Master Employee** - CRUD untuk master data karyawan

## Teknologi

- **NestJS** - Progressive Node.js framework
- **TypeORM** - ORM untuk TypeScript dan JavaScript
- **PostgreSQL** - Database
- **JWT** - JSON Web Token untuk autentikasi
- **Bcrypt** - Hashing password
- **Class Validator** - Validasi DTO
- **Passport** - Middleware autentikasi

## Instalasi

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Setup Database

Pastikan PostgreSQL sudah terinstall dan berjalan. Buat database baru:

```sql
CREATE DATABASE erp_db;
```

### 3. Konfigurasi Environment

Copy file `.env.example` ke `.env` dan sesuaikan konfigurasi:

```bash
cp .env.example .env
```

Edit file `.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=erp_db

PORT=3000
NODE_ENV=development

JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

### 4. Jalankan Migration

```bash
pnpm migration:run
```

## Menjalankan Aplikasi

### Development

```bash
pnpm start:dev
```

### Production

```bash
pnpm build
pnpm start:prod
```

Aplikasi akan berjalan di `http://localhost:3000`

## API Endpoints

Base URL: `http://localhost:3000/api`

### Authentication

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "John Doe",
  "phone": "081234567890",
  "branchId": "uuid-branch",
  "roleIds": ["uuid-role-1", "uuid-role-2"]
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "John Doe",
    "roles": [...]
  }
}
```

### Profile

#### Get Profile
```http
GET /api/profile
Authorization: Bearer {access_token}
```

### Roles

#### Create Role
```http
POST /api/roles
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "name": "Admin",
  "description": "Administrator role",
  "isActive": true,
  "permissionIds": ["uuid-permission-1", "uuid-permission-2"]
}
```

#### Get All Roles
```http
GET /api/roles
Authorization: Bearer {access_token}
```

#### Get Role by ID
```http
GET /api/roles/{id}
Authorization: Bearer {access_token}
```

#### Update Role
```http
PATCH /api/roles/{id}
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "name": "Updated Admin",
  "description": "Updated description"
}
```

#### Delete Role
```http
DELETE /api/roles/{id}
Authorization: Bearer {access_token}
```

### Permissions

#### Create Permission
```http
POST /api/permissions
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "name": "user.create",
  "description": "Create user",
  "module": "user",
  "isActive": true
}
```

#### Get All Permissions
```http
GET /api/permissions
Authorization: Bearer {access_token}
```

#### Get Permission by ID
```http
GET /api/permissions/{id}
Authorization: Bearer {access_token}
```

#### Update Permission
```http
PATCH /api/permissions/{id}
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "name": "user.update",
  "description": "Update user"
}
```

#### Delete Permission
```http
DELETE /api/permissions/{id}
Authorization: Bearer {access_token}
```

### Branches

#### Create Branch
```http
POST /api/branches
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "code": "JKT001",
  "name": "Jakarta Branch",
  "address": "Jl. Sudirman No. 123",
  "phone": "021-12345678",
  "email": "jakarta@company.com",
  "isActive": true
}
```

#### Get All Branches
```http
GET /api/branches
Authorization: Bearer {access_token}
```

#### Get Branch by ID
```http
GET /api/branches/{id}
Authorization: Bearer {access_token}
```

#### Update Branch
```http
PATCH /api/branches/{id}
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "name": "Jakarta Pusat Branch",
  "address": "New Address"
}
```

#### Delete Branch
```http
DELETE /api/branches/{id}
Authorization: Bearer {access_token}
```

### Employees

#### Create Employee
```http
POST /api/employees
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "employeeCode": "EMP001",
  "fullName": "Jane Doe",
  "email": "jane@company.com",
  "phone": "081234567890",
  "address": "Jl. Example No. 456",
  "position": "Manager",
  "department": "IT",
  "hireDate": "2024-01-01",
  "branchId": "uuid-branch",
  "isActive": true
}
```

#### Get All Employees
```http
GET /api/employees
Authorization: Bearer {access_token}
```

#### Get Employee by ID
```http
GET /api/employees/{id}
Authorization: Bearer {access_token}
```

#### Update Employee
```http
PATCH /api/employees/{id}
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "position": "Senior Manager",
  "department": "Operations"
}
```

#### Delete Employee
```http
DELETE /api/employees/{id}
Authorization: Bearer {access_token}
```

## Guards & Permissions

### JWT Auth Guard
Semua endpoint (kecuali login dan register) dilindungi oleh JWT Auth Guard. Anda harus menyertakan token di header:

```
Authorization: Bearer {your-jwt-token}
```

### Permissions Guard
Beberapa endpoint memerlukan permission tertentu:

- **Roles**: `role.create`, `role.read`, `role.update`, `role.delete`
- **Permissions**: `permission.create`, `permission.read`, `permission.update`, `permission.delete`
- **Branches**: `branch.create`, `branch.read`, `branch.update`, `branch.delete`
- **Employees**: `employee.create`, `employee.read`, `employee.update`, `employee.delete`

## Database Schema

### Tables
- **users** - Data user dengan relasi ke roles dan branch
- **roles** - Data role dengan relasi many-to-many ke permissions
- **permissions** - Data permission
- **branches** - Master data cabang
- **employees** - Master data karyawan
- **user_roles** - Junction table untuk user dan roles
- **role_permissions** - Junction table untuk roles dan permissions

## Migration Commands

```bash
# Jalankan migration
pnpm migration:run

# Buat migration baru
pnpm migration:create src/migrations/MigrationName

# Generate migration dari perubahan entity
pnpm migration:generate src/migrations/MigrationName

# Rollback migration terakhir
pnpm migration:revert
```

## Development

### Format Code
```bash
pnpm format
```

### Lint Code
```bash
pnpm lint
```

### Run Tests
```bash
pnpm test
```

## Struktur Folder

```
src/
├── auth/               # Modul autentikasi
│   ├── decorators/    # Custom decorators
│   ├── dto/           # Data Transfer Objects
│   └── guards/        # Guards untuk auth
├── branch/            # Modul branch
├── config/            # Konfigurasi database
├── employee/          # Modul employee
├── migrations/        # Database migrations
├── permission/        # Modul permission
├── role/              # Modul role
├── user/              # Modul user
├── app.module.ts      # Root module
└── main.ts            # Entry point
```

## License

[UNLICENSED]
