# RabbitMQ Examples - Backend ERP

## Quick Start Guide

### 1. Start RabbitMQ with Docker
```bash
# Start all services (PostgreSQL + RabbitMQ)
docker-compose up -d

# Or start only RabbitMQ
docker-compose up -d rabbitmq
```

Verify RabbitMQ is running:
- Management UI: http://localhost:15672
- Username: `admin`
- Password: `admin`

### 2. Start the Application

Terminal 1 - Main Application (Producer):
```bash
pnpm start:dev
```

Terminal 2 - Consumer Microservice:
```bash
pnpm start:consumer
```

## Example 1: Sales Event Flow

### Scenario
When a customer makes a purchase, the system:
1. Creates a sale record
2. Emits a `SALE_CREATED` event
3. Consumer processes the event to:
   - Send confirmation email
   - Update analytics
   - Generate invoice PDF

### Implementation

**Step 1: Create a Sale**
```bash
curl -X POST http://localhost:3000/api/sales \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "saleDate": "2024-11-03",
    "customerName": "John Doe",
    "customerPhone": "081234567890",
    "subtotal": 15000,
    "discountPercent": 0,
    "discountAmount": 0,
    "taxPercent": 11,
    "taxAmount": 1650,
    "total": 16650,
    "paid": 20000,
    "change": 3350,
    "paymentMethod": "cash",
    "items": [
      {
        "itemId": "uuid-of-item",
        "itemName": "Laptop Dell",
        "price": 15000,
        "quantity": 1,
        "discountPercent": 0,
        "discountAmount": 0,
        "subtotal": 15000
      }
    ]
  }'
```

**Step 2: Check Main App Logs**
```
[SaleService] Creating sale transaction
[RabbitMQService] Event emitted: sale.created
[SaleService] Sale created: INV-20241103-0001
```

**Step 3: Check Consumer Logs**
```
[SalesConsumer] Processing sale created event: INV-20241103-0001
[SalesConsumer] Sending confirmation email for sale INV-20241103-0001
[SalesConsumer] Updating sales analytics for INV-20241103-0001
[SalesConsumer] Generating invoice PDF for INV-20241103-0001
[SalesConsumer] Successfully processed sale created: INV-20241103-0001
```

## Example 2: Inventory Low Stock Alert

### Scenario
When stock level drops below minimum threshold:
1. Item stock is updated
2. System checks if stock <= minStock
3. Emits `INVENTORY_LOW_STOCK` event
4. Consumer sends notification to procurement team

### Test Flow

**Step 1: Create an item with low stock**
```bash
curl -X POST http://localhost:3000/api/items \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "code": "ITM999",
    "name": "Test Product",
    "categoryId": "uuid-category",
    "unitId": "uuid-unit",
    "purchasePrice": 10000,
    "sellingPrice": 15000,
    "stock": 5,
    "minStock": 10,
    "isActive": true
  }'
```

**Step 2: Make a sale to trigger low stock**
```bash
# Create sale with quantity that brings stock below minimum
# Sale will emit INVENTORY_UPDATED and INVENTORY_LOW_STOCK events
```

**Step 3: Check Consumer Logs**
```
[InventoryConsumer] Processing inventory update: Test Product (ITM999)
[InventoryConsumer] Stock changed from 5 to 4 for Test Product
[InventoryConsumer] Low stock alert: Test Product has 4 units (min: 10)
[InventoryConsumer] Successfully processed inventory update for Test Product

[InventoryConsumer] Low stock alert: Test Product (ITM999)
[InventoryConsumer] Current stock: 4, Min stock: 10
[InventoryConsumer] Sending low stock notification to procurement for Test Product
[InventoryConsumer] Suggested reorder quantity: 16 units
```

## Example 3: Email Notification

### Scenario
Send email notification asynchronously through RabbitMQ

### Implementation

**In any service:**
```typescript
import { Injectable } from '@nestjs/common';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';
import { MessagePattern, EmailNotificationEvent } from '../rabbitmq/rabbitmq.types';

@Injectable()
export class YourService {
  constructor(private rabbitMQService: RabbitMQService) {}

  async sendWelcomeEmail(user: User) {
    await this.rabbitMQService.emit<EmailNotificationEvent>(
      MessagePattern.NOTIFICATION_EMAIL,
      {
        to: user.email,
        subject: 'Welcome to ERP System',
        template: 'welcome',
        data: {
          name: user.name,
          loginUrl: 'https://yourapp.com/login',
        },
      }
    );
  }
}
```

**Consumer logs:**
```
[NotificationConsumer] Processing email notification to: user@example.com
[NotificationConsumer] Sending email: Welcome to ERP System
[NotificationConsumer] Template: welcome
[NotificationConsumer] Successfully sent email to user@example.com
```

## Example 4: Custom Event Producer

### Create Custom Event in Service

```typescript
// item.service.ts
import { Injectable } from '@nestjs/common';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';
import { MessagePattern } from '../rabbitmq/rabbitmq.types';

@Injectable()
export class ItemService {
  constructor(private rabbitMQService: RabbitMQService) {}

  async updateStock(itemId: string, quantityChange: number) {
    const item = await this.findOne(itemId);
    const previousStock = item.stock;
    
    item.stock += quantityChange;
    await this.itemRepository.save(item);

    // Emit inventory updated event
    await this.rabbitMQService.emit(MessagePattern.INVENTORY_UPDATED, {
      itemId: item.id,
      itemName: item.name,
      itemCode: item.code,
      previousStock,
      currentStock: item.stock,
      minStock: item.minStock,
      updatedAt: new Date(),
    });

    // Check for low stock
    if (item.stock <= item.minStock && item.stock > 0) {
      await this.rabbitMQService.emit(MessagePattern.INVENTORY_LOW_STOCK, {
        itemId: item.id,
        itemName: item.name,
        itemCode: item.code,
        currentStock: item.stock,
        minStock: item.minStock,
        reorderLevel: item.minStock * 2,
      });
    }

    return item;
  }
}
```

## Example 5: Testing Manually

### Using RabbitMQ Management UI

1. **Access Management UI**
   - URL: http://localhost:15672
   - Login: admin/admin

2. **Navigate to Queues**
   - Click "Queues" tab
   - You should see: `sales_queue`, `inventory_queue`, `notifications_queue`

3. **Publish Test Message**
   - Click on a queue name
   - Scroll to "Publish message"
   - Enter payload:
   ```json
   {
     "pattern": "sale.created",
     "data": {
       "saleId": "test-123",
       "invoiceNumber": "TEST-001",
       "total": 100000,
       "customerName": "Test Customer",
       "items": []
     }
   }
   ```
   - Click "Publish message"

4. **Check Consumer Logs**
   - You should see the consumer processing the message

### Using curl to Trigger Events

```bash
# Login first
TOKEN=$(curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}' \
  | jq -r '.access_token')

# Create a sale (triggers SALE_CREATED event)
curl -X POST http://localhost:3000/api/sales \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "Test Customer",
    "total": 100000,
    "paid": 100000,
    "change": 0,
    "paymentMethod": "cash",
    "items": [...]
  }'
```

## Example 6: Monitoring Messages

### Check Queue Stats

```bash
# Using docker exec
docker exec erp-rabbitmq rabbitmqctl list_queues

# Output:
# sales_queue     0
# inventory_queue 0
# notifications_queue 0
```

### View Messages in Queue

```bash
# Get message from queue (without consuming)
docker exec erp-rabbitmq rabbitmqctl list_queues name messages consumers
```

### Clear Queue

```bash
# Purge all messages from a queue
docker exec erp-rabbitmq rabbitmqctl purge_queue sales_queue
```

## Example 7: Error Handling

### Failed Message Processing

```typescript
@Controller()
export class SalesConsumer {
  @EventPattern(MessagePattern.SALE_CREATED)
  async handleSaleCreated(@Payload() data: SaleCreatedEvent, @Ctx() context: RmqContext) {
    try {
      // Process message
      await this.processMessage(data);
      
      // Acknowledge success
      const channel = context.getChannelRef();
      const originalMsg = context.getMessage();
      channel.ack(originalMsg);
      
    } catch (error) {
      this.logger.error('Processing failed', error);
      
      // Negative acknowledge - message will be requeued
      const channel = context.getChannelRef();
      const originalMsg = context.getMessage();
      channel.nack(originalMsg, false, true); // requeue = true
    }
  }
}
```

## Example 8: Multiple Consumers

### Scale Consumers for Load Balancing

Terminal 1:
```bash
pnpm start:consumer
```

Terminal 2:
```bash
pnpm start:consumer
```

Terminal 3:
```bash
pnpm start:consumer
```

**Result:**
- Messages will be distributed across all consumers
- Each consumer processes messages in parallel
- Automatic load balancing

## Example 9: Custom Queue

### Add New Queue

**1. Update config:**
```typescript
// rabbitmq.config.ts
queues: {
  sales: 'sales_queue',
  inventory: 'inventory_queue',
  notifications: 'notifications_queue',
  reports: 'reports_queue', // NEW
}
```

**2. Create consumer:**
```typescript
// reports.consumer.ts
@Controller()
export class ReportsConsumer {
  @EventPattern(MessagePattern.REPORT_GENERATE_SALES)
  async handleGenerateSalesReport(@Payload() data: any, @Ctx() context: RmqContext) {
    this.logger.log('Generating sales report...');
    
    // Generate report logic
    
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    channel.ack(originalMsg);
  }
}
```

**3. Emit event:**
```typescript
await this.rabbitMQService.emit(MessagePattern.REPORT_GENERATE_SALES, {
  startDate: '2024-11-01',
  endDate: '2024-11-30',
  requestedBy: 'admin@example.com',
});
```

## Example 10: Production Deployment

### Docker Compose for Production

```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      RABBITMQ_URL: amqp://rabbitmq:5672
    depends_on:
      - rabbitmq
      - postgres

  consumer:
    build: .
    command: pnpm start:consumer
    environment:
      RABBITMQ_URL: amqp://rabbitmq:5672
    depends_on:
      - rabbitmq
    deploy:
      replicas: 3 # Run 3 consumer instances

  rabbitmq:
    image: rabbitmq:3-management
    ports:
      - "5672:5672"
      - "15672:15672"

  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: erp_db
```

## Troubleshooting

### Consumer Not Receiving Messages

1. **Check consumer is running:**
   ```bash
   # Should see "RabbitMQ Consumer microservice is listening..."
   ```

2. **Check RabbitMQ connection:**
   ```bash
   docker logs erp-rabbitmq
   ```

3. **Verify queue exists:**
   - Go to http://localhost:15672
   - Check Queues tab

### Messages Piling Up

1. **Check consumer logs for errors**
2. **Increase consumer instances:**
   ```bash
   # Run multiple consumer instances
   pnpm start:consumer  # Terminal 1
   pnpm start:consumer  # Terminal 2
   pnpm start:consumer  # Terminal 3
   ```

3. **Check consumer performance:**
   - Add timing logs
   - Optimize processing logic

---

## Summary

✅ **Sales events**: Automatic email, analytics, invoice generation  
✅ **Inventory alerts**: Low stock and out-of-stock notifications  
✅ **Email queue**: Asynchronous email sending  
✅ **Scalable**: Multiple consumer instances  
✅ **Reliable**: Message acknowledgment and retry  
✅ **Monitored**: RabbitMQ Management UI  

**Next Steps:**
1. Implement actual email sending (nodemailer)
2. Add SMS notifications (Twilio)
3. Create report generation workers
4. Add monitoring (Prometheus/Grafana)
5. Implement dead letter queues

---

Last Updated: November 3, 2024
