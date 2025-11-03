# API Documentation - Items, Categories, Units & Sales

## Categories API

### Create Category
```http
POST /api/categories
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "code": "CAT001",
  "name": "Electronics",
  "description": "Electronic items",
  "isActive": true
}
```

### Get All Categories
```http
GET /api/categories
Authorization: Bearer {access_token}
```

### Get Category by ID
```http
GET /api/categories/{id}
Authorization: Bearer {access_token}
```

### Update Category
```http
PATCH /api/categories/{id}
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "name": "Updated Category",
  "description": "Updated description"
}
```

### Delete Category
```http
DELETE /api/categories/{id}
Authorization: Bearer {access_token}
```

---

## Units API

### Create Unit
```http
POST /api/units
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "code": "PCS",
  "name": "Pieces",
  "description": "Per piece",
  "isActive": true
}
```

### Get All Units
```http
GET /api/units
Authorization: Bearer {access_token}
```

### Get Unit by ID
```http
GET /api/units/{id}
Authorization: Bearer {access_token}
```

### Update Unit
```http
PATCH /api/units/{id}
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "name": "Updated Unit"
}
```

### Delete Unit
```http
DELETE /api/units/{id}
Authorization: Bearer {access_token}
```

---

## Items (Barang) API

### Create Item
```http
POST /api/items
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "code": "ITM001",
  "name": "Laptop Dell",
  "description": "Dell Laptop 14 inch",
  "categoryId": "uuid-category",
  "unitId": "uuid-unit",
  "purchasePrice": 5000000,
  "sellingPrice": 7000000,
  "stock": 10,
  "minStock": 2,
  "barcode": "1234567890001",
  "isActive": true
}
```

### Get All Items
```http
GET /api/items
Authorization: Bearer {access_token}
```

Response:
```json
[
  {
    "id": "uuid",
    "code": "ITM001",
    "name": "Laptop Dell",
    "description": "Dell Laptop 14 inch",
    "category": {
      "id": "uuid",
      "code": "CAT001",
      "name": "Electronics"
    },
    "unit": {
      "id": "uuid",
      "code": "PCS",
      "name": "Pieces"
    },
    "purchasePrice": 5000000,
    "sellingPrice": 7000000,
    "stock": 10,
    "minStock": 2,
    "barcode": "1234567890001",
    "isActive": true,
    "createdAt": "2024-11-01T00:00:00.000Z",
    "updatedAt": "2024-11-01T00:00:00.000Z"
  }
]
```

### Get Item by ID
```http
GET /api/items/{id}
Authorization: Bearer {access_token}
```

### Get Item by Barcode
```http
GET /api/items/barcode/{barcode}
Authorization: Bearer {access_token}
```

### Update Item
```http
PATCH /api/items/{id}
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "stock": 15,
  "sellingPrice": 7500000
}
```

### Delete Item
```http
DELETE /api/items/{id}
Authorization: Bearer {access_token}
```

---

## Sales (Penjualan Kasir) API

### Create Sale (POS Transaction)
```http
POST /api/sales
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "saleDate": "2024-11-01",
  "branchId": "uuid-branch",
  "customerName": "John Doe",
  "customerPhone": "081234567890",
  "subtotal": 7075000,
  "discountPercent": 5,
  "discountAmount": 353750,
  "taxPercent": 11,
  "taxAmount": 739537.5,
  "total": 7460787.5,
  "paid": 7500000,
  "change": 39212.5,
  "paymentMethod": "cash",
  "notes": "Thank you for shopping",
  "items": [
    {
      "itemId": "uuid-laptop",
      "itemName": "Laptop Dell",
      "price": 7000000,
      "quantity": 1,
      "discountPercent": 0,
      "discountAmount": 0,
      "subtotal": 7000000
    },
    {
      "itemId": "uuid-mouse",
      "itemName": "Mouse Wireless",
      "price": 75000,
      "quantity": 1,
      "discountPercent": 0,
      "discountAmount": 0,
      "subtotal": 75000
    }
  ]
}
```

Response:
```json
{
  "id": "uuid",
  "invoiceNumber": "INV-20241101-0001",
  "saleDate": "2024-11-01",
  "user": {
    "id": "uuid",
    "email": "admin@example.com",
    "fullName": "System Administrator"
  },
  "branch": {
    "id": "uuid",
    "code": "HQ001",
    "name": "Head Quarter"
  },
  "customerName": "John Doe",
  "customerPhone": "081234567890",
  "subtotal": 7075000,
  "discountPercent": 5,
  "discountAmount": 353750,
  "taxPercent": 11,
  "taxAmount": 739537.5,
  "total": 7460787.5,
  "paid": 7500000,
  "change": 39212.5,
  "paymentMethod": "cash",
  "notes": "Thank you for shopping",
  "items": [
    {
      "id": "uuid",
      "itemId": "uuid-laptop",
      "itemName": "Laptop Dell",
      "price": 7000000,
      "quantity": 1,
      "discountPercent": 0,
      "discountAmount": 0,
      "subtotal": 7000000,
      "item": {
        "id": "uuid-laptop",
        "code": "ITM001",
        "name": "Laptop Dell"
      }
    }
  ],
  "createdAt": "2024-11-01T00:00:00.000Z",
  "updatedAt": "2024-11-01T00:00:00.000Z"
}
```

### Get All Sales
```http
GET /api/sales
Authorization: Bearer {access_token}
```

### Get Sale by ID
```http
GET /api/sales/{id}
Authorization: Bearer {access_token}
```

### Get Sale by Invoice Number
```http
GET /api/sales/invoice/{invoiceNumber}
Authorization: Bearer {access_token}
```

Example:
```http
GET /api/sales/invoice/INV-20241101-0001
Authorization: Bearer {access_token}
```

### Get Sales Report
```http
GET /api/sales/report?startDate=2024-11-01&endDate=2024-11-30
Authorization: Bearer {access_token}
```

Response:
```json
{
  "startDate": "2024-11-01",
  "endDate": "2024-11-30",
  "totalSales": 25,
  "totalRevenue": 150000000,
  "totalDiscount": 5000000,
  "totalTax": 16500000,
  "sales": [...]
}
```

---

## Payment Methods

Supported payment methods:
- `cash` - Cash payment
- `card` - Credit/Debit card
- `transfer` - Bank transfer
- `qris` - QRIS payment

---

## Permissions Required

### Category Module
- `category.create` - Create categories
- `category.read` - Read categories
- `category.update` - Update categories
- `category.delete` - Delete categories

### Unit Module
- `unit.create` - Create units
- `unit.read` - Read units
- `unit.update` - Update units
- `unit.delete` - Delete units

### Item Module
- `item.create` - Create items
- `item.read` - Read items
- `item.update` - Update items
- `item.delete` - Delete items

### Sale Module
- `sale.create` - Create sales transactions
- `sale.read` - Read sales data and reports

---

## Features

### Automatic Invoice Numbering
Invoice numbers are automatically generated with format:
`INV-YYYYMMDD-XXXX`

Example: `INV-20241101-0001`

### Stock Management
When a sale is created, the system automatically:
1. Validates stock availability
2. Reduces stock for each item sold
3. Uses database transaction to ensure data consistency
4. Rolls back if any error occurs

### Sales Calculation
The system calculates:
- Subtotal per item (price × quantity - item discount)
- Total subtotal (sum of all items)
- Discount amount (subtotal × discount%)
- Tax amount ((subtotal - discount) × tax%)
- Total (subtotal - discount + tax)
- Change (paid - total)

---

## Example: Complete POS Flow

1. **Scan/Search Item by Barcode**
```http
GET /api/items/barcode/1234567890001
```

2. **Add Items to Cart** (on frontend)

3. **Create Sale Transaction**
```http
POST /api/sales
{
  "items": [...],
  "subtotal": 100000,
  "total": 111000,
  "paid": 150000,
  ...
}
```

4. **Print Receipt** (using sale data from response)

5. **View Sales Report**
```http
GET /api/sales/report?startDate=2024-11-01&endDate=2024-11-30
```
