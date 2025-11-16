# Quick Start Guide - Backend ERP

## Setup Cepat (5 Menit)

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Setup Database PostgreSQL

Buat database baru:
```sql
CREATE DATABASE erp_db;
```

Atau menggunakan Docker:
```bash
docker run --name postgres-erp -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=erp_db -p 5432:5432 -d postgres
```

### 3. Konfigurasi Environment

File `.env` sudah dibuat dengan konfigurasi default. Edit jika perlu:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=erp_db
```

### 4. Jalankan Migration

```bash
pnpm migration:run
```

### 5. Seed Database (Optional)

Untuk membuat data awal (admin user, permissions, roles):
```bash
pnpm seed
```

Credential admin yang dibuat:
- Email: `admin@example.com`
- Password: `admin123`

### 6. Jalankan Aplikasi

```bash
pnpm start:dev
```

Aplikasi berjalan di: `http://localhost:3000`

## Testing API

### Menggunakan Postman

1. Import file `postman_collection.json` ke Postman
2. Login untuk mendapatkan token
3. Token otomatis tersimpan di collection variable

### Menggunakan cURL

#### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

#### Get Profile (dengan token)
```bash
curl -X GET http://localhost:3000/api/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### Get All Branches
```bash
curl -X GET http://localhost:3000/api/branches \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Troubleshooting

### Database Connection Error
- Pastikan PostgreSQL berjalan
- Cek kredensial di file `.env`
- Pastikan database `erp_db` sudah dibuat

### Migration Error
- Pastikan database kosong saat pertama kali migration
- Atau drop database dan buat ulang

### Port Already in Use
- Ubah PORT di `.env` ke port lain (misal: 3001)

## Dokumentasi Lengkap

Lihat file `README_API.md` untuk dokumentasi lengkap semua endpoint.

## Struktur Permissions

Setelah seed, permission yang tersedia:

### Role Module
- `role.create` - Create new roles
- `role.read` - View roles
- `role.update` - Update roles
- `role.delete` - Delete roles

### Permission Module
- `permission.create` - Create new permissions
- `permission.read` - View permissions
- `permission.update` - Update permissions
- `permission.delete` - Delete permissions

### Branch Module
- `branch.create` - Create new branches
- `branch.read` - View branches
- `branch.update` - Update branches
- `branch.delete` - Delete branches

### Employee Module
- `employee.create` - Create new employees
- `employee.read` - View employees
- `employee.update` - Update employees
- `employee.delete` - Delete employees

### User Module
- `user.create` - Create new users
- `user.read` - View users
- `user.update` - Update users
- `user.delete` - Delete users

## Default Roles

### Admin
Full access ke semua permissions

### User
Read-only access ke semua module
