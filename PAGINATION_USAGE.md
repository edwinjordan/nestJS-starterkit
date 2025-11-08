# Pagination Implementation Guide

## Overview
Semua endpoint GET list data telah diimplementasikan dengan pagination untuk performa yang lebih baik.

## Response Format

```json
{
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

## Query Parameters

### Required Parameters (None - semua optional)

### Optional Parameters

| Parameter | Type | Default | Description | Example |
|-----------|------|---------|-------------|---------|
| `page` | number | 1 | Nomor halaman (min: 1) | `page=1` |
| `limit` | number | 10 | Jumlah data per halaman (min: 1, max: 100) | `limit=20` |
| `search` | string | - | Keyword pencarian | `search=admin` |
| `sortBy` | string | createdAt | Field untuk sorting | `sortBy=name` |
| `sortOrder` | ASC\|DESC | DESC | Urutan sorting | `sortOrder=ASC` |

## Usage Examples

### 1. Basic Request (Default Pagination)
```bash
GET /api/roles
```
Response: Page 1, 10 items

### 2. Custom Page and Limit
```bash
GET /api/roles?page=2&limit=20
```
Response: Page 2, 20 items

### 3. Search
```bash
GET /api/roles?search=admin
```
Searches in: name, description

### 4. Sorting
```bash
GET /api/roles?sortBy=name&sortOrder=ASC
```
Sort by name ascending

### 5. Combined Parameters
```bash
GET /api/roles?page=1&limit=15&search=manager&sortBy=createdAt&sortOrder=DESC
```

## Endpoint-Specific Search Fields

### Roles (`/api/roles`)
- Search fields: name, description
- Sort fields: name, createdAt, updatedAt

### Permissions (`/api/permissions`)
- Search fields: name, description
- Sort fields: name, createdAt, updatedAt

### Branches (`/api/branches`)
- Search fields: name, address, phone
- Sort fields: name, code, createdAt, updatedAt

### Employees (`/api/employees`)
- Search fields: name, email, phone, position
- Sort fields: name, position, createdAt, updatedAt

### Categories (`/api/categories`)
- Search fields: name, description
- Sort fields: name, createdAt, updatedAt

### Units (`/api/units`)
- Search fields: name, abbreviation
- Sort fields: name, abbreviation, createdAt, updatedAt

### Items (`/api/items`)
- Search fields: name, code, barcode, category.name
- Sort fields: name, code, price, stock, createdAt, updatedAt

### Sales (`/api/sales`)
- Search fields: invoiceNumber, customerName, customerPhone
- Sort fields: invoiceNumber, total, saleDate, createdAt, updatedAt

## Frontend Integration Examples

### React/JavaScript
```javascript
const fetchRoles = async (page = 1, limit = 10, search = '') => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(search && { search }),
  });

  const response = await fetch(`/api/roles?${params}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const result = await response.json();
  
  return {
    data: result.data,
    pagination: result.meta
  };
};
```

### cURL Examples
```bash
# Get first page
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3000/api/roles?page=1&limit=10"

# Search roles
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3000/api/roles?search=admin"

# Sort by name
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3000/api/roles?sortBy=name&sortOrder=ASC"
```

## Performance Considerations

1. **Default Limit**: 10 items (mencegah payload terlalu besar)
2. **Max Limit**: 100 items (hard cap untuk performa)
3. **Database Indexing**: Pastikan field yang sering di-search dan di-sort memiliki index
4. **Case Insensitive Search**: Menggunakan ILIKE untuk PostgreSQL

## Database Optimization

Untuk performa optimal, tambahkan index pada field yang sering di-filter:

```sql
-- Examples for roles table
CREATE INDEX idx_roles_name ON roles (name);
CREATE INDEX idx_roles_created_at ON roles (created_at);

-- For search with ILIKE
CREATE INDEX idx_roles_name_lower ON roles (LOWER(name));
```

## Migration from Non-Paginated Endpoints

### Before
```javascript
const roles = await fetch('/api/roles');
// Returns: Role[]
```

### After
```javascript
const response = await fetch('/api/roles?page=1&limit=10');
// Returns: { data: Role[], meta: PaginationMeta }
```

### Backward Compatibility Note
Jika Anda ingin mendapatkan semua data (tanpa pagination):
```javascript
const getAllRoles = async () => {
  const response = await fetch('/api/roles?limit=100');
  return response.data;
};
```

⚠️ **Warning**: Gunakan limit tinggi dengan hati-hati untuk menghindari masalah performa.
