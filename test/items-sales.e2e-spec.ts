import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';

describe('Items & Sales E2E Tests', () => {
  let app: INestApplication<App>;
  let authToken: string;
  let dataSource: DataSource;
  let categoryId: string;
  let unitId: string;
  let itemId: string;
  let saleId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    dataSource = moduleFixture.get<DataSource>(DataSource);

    // Login as admin
    const loginResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'admin123',
      });

    authToken = loginResponse.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Category Module', () => {
    describe('POST /api/categories', () => {
      it('should create a new category', async () => {
        const response = await request(app.getHttpServer())
          .post('/api/categories')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            code: 'TEST001',
            name: 'Test Category',
            description: 'Category for testing',
            isActive: true,
          })
          .expect(201);

        expect(response.body).toHaveProperty('id');
        expect(response.body.code).toBe('TEST001');
        expect(response.body.name).toBe('Test Category');

        categoryId = response.body.id;
      });

      it('should fail without authentication', async () => {
        await request(app.getHttpServer())
          .post('/api/categories')
          .send({
            code: 'TEST002',
            name: 'Test Category 2',
          })
          .expect(401);
      });
    });

    describe('GET /api/categories', () => {
      it('should return all categories', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/categories')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
      });
    });

    describe('GET /api/categories/:id', () => {
      it('should return a category by id', async () => {
        const response = await request(app.getHttpServer())
          .get(`/api/categories/${categoryId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.id).toBe(categoryId);
        expect(response.body.code).toBe('TEST001');
      });
    });

    describe('PATCH /api/categories/:id', () => {
      it('should update a category', async () => {
        const response = await request(app.getHttpServer())
          .patch(`/api/categories/${categoryId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            name: 'Updated Test Category',
          })
          .expect(200);

        expect(response.body.name).toBe('Updated Test Category');
      });
    });
  });

  describe('Unit Module', () => {
    describe('POST /api/units', () => {
      it('should create a new unit', async () => {
        const response = await request(app.getHttpServer())
          .post('/api/units')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            code: 'TESTUNIT',
            name: 'Test Unit',
            description: 'Unit for testing',
            isActive: true,
          })
          .expect(201);

        expect(response.body).toHaveProperty('id');
        expect(response.body.code).toBe('TESTUNIT');
        expect(response.body.name).toBe('Test Unit');

        unitId = response.body.id;
      });
    });

    describe('GET /api/units', () => {
      it('should return all units', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/units')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Item Module', () => {
    describe('POST /api/items', () => {
      it('should create a new item', async () => {
        const response = await request(app.getHttpServer())
          .post('/api/items')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            code: 'TESTITEM001',
            name: 'Test Product',
            description: 'Product for testing',
            categoryId,
            unitId,
            purchasePrice: 10000,
            sellingPrice: 15000,
            stock: 100,
            minStock: 10,
            barcode: '9999999999999',
            isActive: true,
          })
          .expect(201);

        expect(response.body).toHaveProperty('id');
        expect(response.body.code).toBe('TESTITEM001');
        expect(response.body.name).toBe('Test Product');
        expect(response.body.stock).toBe(100);

        itemId = response.body.id;
      });

      it('should fail with invalid data', async () => {
        await request(app.getHttpServer())
          .post('/api/items')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            code: 'INVALID',
            // Missing required fields
          })
          .expect(400);
      });
    });

    describe('GET /api/items', () => {
      it('should return all items with relations', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/items')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
        
        const item = response.body.find((i: any) => i.id === itemId);
        expect(item).toBeDefined();
        expect(item.category).toBeDefined();
        expect(item.unit).toBeDefined();
      });
    });

    describe('GET /api/items/barcode/:barcode', () => {
      it('should find item by barcode', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/items/barcode/9999999999999')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.barcode).toBe('9999999999999');
        expect(response.body.code).toBe('TESTITEM001');
      });

      it('should return 404 for non-existent barcode', async () => {
        await request(app.getHttpServer())
          .get('/api/items/barcode/0000000000000')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(404);
      });
    });

    describe('PATCH /api/items/:id', () => {
      it('should update item stock', async () => {
        const response = await request(app.getHttpServer())
          .patch(`/api/items/${itemId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            stock: 150,
          })
          .expect(200);

        expect(response.body.stock).toBe(150);
      });
    });
  });

  describe('Sale Module', () => {
    describe('POST /api/sales', () => {
      it('should create a new sale transaction', async () => {
        const response = await request(app.getHttpServer())
          .post('/api/sales')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            saleDate: new Date().toISOString(),
            customerName: 'Test Customer',
            customerPhone: '081234567890',
            subtotal: 15000,
            discountPercent: 0,
            discountAmount: 0,
            taxPercent: 11,
            taxAmount: 1650,
            total: 16650,
            paid: 20000,
            change: 3350,
            paymentMethod: 'cash',
            notes: 'Test sale',
            items: [
              {
                itemId,
                itemName: 'Test Product',
                price: 15000,
                quantity: 1,
                discountPercent: 0,
                discountAmount: 0,
                subtotal: 15000,
              },
            ],
          })
          .expect(201);

        expect(response.body).toHaveProperty('id');
        expect(response.body).toHaveProperty('invoiceNumber');
        expect(response.body.invoiceNumber).toMatch(/^INV-\d{8}-\d{4}$/);
        expect(response.body.total).toBe(16650);
        expect(response.body.items).toBeDefined();
        expect(response.body.items.length).toBe(1);

        saleId = response.body.id;
      });

      it('should fail with insufficient stock', async () => {
        await request(app.getHttpServer())
          .post('/api/sales')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            saleDate: new Date().toISOString(),
            customerName: 'Test Customer',
            customerPhone: '081234567890',
            subtotal: 150000,
            total: 166500,
            paid: 200000,
            change: 33500,
            paymentMethod: 'cash',
            items: [
              {
                itemId,
                itemName: 'Test Product',
                price: 15000,
                quantity: 1000, // More than available stock
                discountPercent: 0,
                discountAmount: 0,
                subtotal: 15000000,
              },
            ],
          })
          .expect(400);
      });

      it('should update item stock after sale', async () => {
        const itemResponse = await request(app.getHttpServer())
          .get(`/api/items/${itemId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        // Stock should be 150 - 1 = 149
        expect(itemResponse.body.stock).toBe(149);
      });
    });

    describe('GET /api/sales', () => {
      it('should return all sales', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/sales')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
      });
    });

    describe('GET /api/sales/:id', () => {
      it('should return sale by id', async () => {
        const response = await request(app.getHttpServer())
          .get(`/api/sales/${saleId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.id).toBe(saleId);
        expect(response.body.items).toBeDefined();
        expect(response.body.user).toBeDefined();
      });
    });

    describe('GET /api/sales/invoice/:invoiceNumber', () => {
      it('should find sale by invoice number', async () => {
        const saleResponse = await request(app.getHttpServer())
          .get(`/api/sales/${saleId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        const invoiceNumber = saleResponse.body.invoiceNumber;

        const response = await request(app.getHttpServer())
          .get(`/api/sales/invoice/${invoiceNumber}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.invoiceNumber).toBe(invoiceNumber);
        expect(response.body.id).toBe(saleId);
      });
    });

    describe('GET /api/sales/report', () => {
      it('should return sales report', async () => {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        const endDate = new Date();

        const response = await request(app.getHttpServer())
          .get('/api/sales/report')
          .query({
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
          })
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('totalSales');
        expect(response.body).toHaveProperty('totalRevenue');
        expect(response.body).toHaveProperty('totalDiscount');
        expect(response.body).toHaveProperty('totalTax');
        expect(response.body).toHaveProperty('sales');
        expect(Array.isArray(response.body.sales)).toBe(true);
      });
    });
  });

  describe('Cleanup', () => {
    it('should delete test item', async () => {
      await request(app.getHttpServer())
        .delete(`/api/items/${itemId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });

    it('should delete test unit', async () => {
      await request(app.getHttpServer())
        .delete(`/api/units/${unitId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });

    it('should delete test category', async () => {
      await request(app.getHttpServer())
        .delete(`/api/categories/${categoryId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });
  });
});
