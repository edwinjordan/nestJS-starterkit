# RabbitMQ Integration - Backend ERP

## 🐰 Overview

This project integrates RabbitMQ for asynchronous message processing, enabling event-driven architecture for the ERP system.

## 📦 Features

### Message Patterns Implemented

1. **Sales Events**
   - `sale.created` - Triggered when a new sale is created
   - `sale.updated` - Triggered when a sale is updated
   - `sale.cancelled` - Triggered when a sale is cancelled

2. **Inventory Events**
   - `inventory.updated` - Stock level changes
   - `inventory.low_stock` - Low stock alerts
   - `inventory.out_of_stock` - Out of stock notifications

3. **Notification Events**
   - `notification.email` - Email notifications
   - `notification.sms` - SMS notifications
   - `notification.system` - In-app notifications

4. **Report Events**
   - `report.generate.sales` - Generate sales reports
   - `report.generate.inventory` - Generate inventory reports

## 🚀 Setup

### 1. Install Dependencies

```bash
pnpm install
```

Packages installed:
- `@nestjs/microservices` - NestJS microservices support
- `amqplib` - RabbitMQ client library
- `amqp-connection-manager` - Connection management
- `@types/amqplib` - TypeScript types

### 2. Install RabbitMQ

#### Using Docker (Recommended)
```bash
docker run -d --name rabbitmq \
  -p 5672:5672 \
  -p 15672:15672 \
  -e RABBITMQ_DEFAULT_USER=admin \
  -e RABBITMQ_DEFAULT_PASS=admin \
  rabbitmq:3-management
```

#### Using Docker Compose
```yaml
# docker-compose.yml
version: '3.8'
services:
  rabbitmq:
    image: rabbitmq:3-management
    container_name: erp-rabbitmq
    ports:
      - "5672:5672"   # AMQP port
      - "15672:15672" # Management UI
    environment:
      RABBITMQ_DEFAULT_USER: admin
      RABBITMQ_DEFAULT_PASS: admin
    volumes:
      - rabbitmq_data:/var/lib/rabbitmq

volumes:
  rabbitmq_data:
```

Run with:
```bash
docker-compose up -d rabbitmq
```

#### Manual Installation
- **Ubuntu/Debian**: https://www.rabbitmq.com/install-debian.html
- **macOS**: `brew install rabbitmq`
- **Windows**: https://www.rabbitmq.com/install-windows.html

### 3. Configure Environment

Copy `.env.example` to `.env` and configure:

```bash
# RabbitMQ
RABBITMQ_URL=amqp://localhost:5672
RABBITMQ_QUEUE_SALES=sales_queue
RABBITMQ_QUEUE_INVENTORY=inventory_queue
RABBITMQ_QUEUE_NOTIFICATIONS=notifications_queue
RABBITMQ_EXCHANGE=erp_exchange
```

## 🏃 Running the Application

### Run Main Application (Producer)
```bash
pnpm start:dev
```

### Run Consumer Microservice
```bash
# In a separate terminal
pnpm start:consumer
```

Or add to `package.json`:
```json
{
  "scripts": {
    "start:consumer": "ts-node -r tsconfig-paths/register src/main.consumer.ts"
  }
}
```

## 📊 Architecture

```
┌─────────────────┐
│  NestJS API     │
│  (Producer)     │
└────────┬────────┘
         │
         │ Emit Events
         ▼
┌─────────────────┐
│   RabbitMQ      │
│   Message Broker│
└────────┬────────┘
         │
         │ Consume Events
         ▼
┌─────────────────┐
│  Consumer       │
│  Microservice   │
└─────────────────┘
```

## 💡 Usage Examples

### 1. Emit Event from Service

```typescript
// In sale.service.ts
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';
import { MessagePattern, SaleCreatedEvent } from '../rabbitmq/rabbitmq.types';

@Injectable()
export class SaleService {
  constructor(
    private rabbitMQService: RabbitMQService,
  ) {}

  async create(createSaleDto: CreateSaleDto) {
    // ... create sale logic
    
    // Emit event
    await this.rabbitMQService.emit<SaleCreatedEvent>(
      MessagePattern.SALE_CREATED,
      {
        saleId: sale.id,
        invoiceNumber: sale.invoiceNumber,
        total: sale.total,
        customerName: sale.customerName,
        items: sale.items,
        createdAt: sale.createdAt,
      }
    );
    
    return sale;
  }
}
```

### 2. Consume Events

```typescript
// In sales.consumer.ts
import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { MessagePattern, SaleCreatedEvent } from '../rabbitmq/rabbitmq.types';

@Controller()
export class SalesConsumer {
  @EventPattern(MessagePattern.SALE_CREATED)
  async handleSaleCreated(@Payload() data: SaleCreatedEvent) {
    console.log('Sale created:', data.invoiceNumber);
    
    // Send confirmation email
    await this.sendEmail(data);
    
    // Update analytics
    await this.updateAnalytics(data);
    
    // Generate invoice PDF
    await this.generateInvoice(data);
  }
}
```

### 3. Send Message with Response

```typescript
// Request-response pattern
const result = await this.rabbitMQService.send(
  MessagePattern.REPORT_GENERATE_SALES,
  { startDate, endDate }
);

result.subscribe(response => {
  console.log('Report generated:', response);
});
```

## 🔍 Testing RabbitMQ

### 1. Check RabbitMQ Status
```bash
# Using Docker
docker ps | grep rabbitmq

# Check logs
docker logs rabbitmq
```

### 2. Access Management UI
Open browser: http://localhost:15672

- Username: `admin`
- Password: `admin`

### 3. View Queues
Navigate to: **Queues** tab
- `sales_queue`
- `inventory_queue`
- `notifications_queue`

### 4. Test Manually

#### Publish Message via API
```bash
curl -X POST http://localhost:3000/api/sales \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "items": [...],
    "total": 100000
  }'
```

#### Check Consumer Logs
You should see in consumer terminal:
```
[SalesConsumer] Processing sale created event: INV-20241103-0001
[SalesConsumer] Sending confirmation email for sale INV-20241103-0001
```

## 📝 Event Flow Example

### Sale Creation Flow

```
1. User creates sale via API
   ↓
2. SaleService.create() saves to database
   ↓
3. Emit SALE_CREATED event to RabbitMQ
   ↓
4. RabbitMQ routes to sales_queue
   ↓
5. SalesConsumer receives event
   ↓
6. Parallel processing:
   - Send confirmation email
   - Update analytics
   - Generate invoice PDF
   ↓
7. For each item, emit INVENTORY_UPDATED
   ↓
8. InventoryConsumer receives events
   ↓
9. Check stock levels:
   - If low: emit LOW_STOCK alert
   - If out: emit OUT_OF_STOCK alert
```

## 🛠️ Advanced Features

### 1. Dead Letter Queue (DLQ)

```typescript
// Configure in rabbitmq.module.ts
queueOptions: {
  durable: true,
  arguments: {
    'x-dead-letter-exchange': 'dlx-exchange',
    'x-dead-letter-routing-key': 'dlq',
  },
}
```

### 2. Message TTL (Time To Live)

```typescript
queueOptions: {
  durable: true,
  messageTtl: 60000, // 1 minute
}
```

### 3. Priority Queue

```typescript
queueOptions: {
  durable: true,
  arguments: {
    'x-max-priority': 10,
  },
}

// Send with priority
this.rabbitMQService.emit(pattern, data, {
  priority: 5,
});
```

### 4. Retry Mechanism

```typescript
@EventPattern(MessagePattern.SALE_CREATED)
async handleSaleCreated(@Payload() data: SaleCreatedEvent, @Ctx() context: RmqContext) {
  try {
    await this.process(data);
    
    // Acknowledge success
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    channel.ack(originalMsg);
  } catch (error) {
    // Negative acknowledge - requeue for retry
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    channel.nack(originalMsg, false, true);
  }
}
```

## 📊 Monitoring

### 1. RabbitMQ Management UI
- **Queues**: Monitor queue depth, message rates
- **Connections**: Active connections
- **Channels**: Channel usage
- **Exchanges**: Message routing

### 2. Application Logs
```typescript
// Enable debug logging
this.logger.debug('Event emitted', { pattern, data });
```

### 3. Message Metrics
- Messages published
- Messages consumed
- Messages acknowledged
- Messages rejected
- Queue depth

## 🔒 Security Best Practices

1. **Use Strong Credentials**
   ```bash
   RABBITMQ_URL=amqp://user:strong_password@localhost:5672
   ```

2. **Enable SSL/TLS**
   ```bash
   RABBITMQ_URL=amqps://user:password@localhost:5671
   ```

3. **Limit User Permissions**
   - Create separate users for producers and consumers
   - Grant minimum required permissions

4. **Network Security**
   - Use firewall rules
   - Restrict port 5672 access
   - Use VPN for remote access

## 🚦 Production Deployment

### 1. Clustering
Set up RabbitMQ cluster for high availability:
```bash
docker-compose.yml with multiple RabbitMQ nodes
```

### 2. Load Balancing
Use HAProxy or Nginx for load balancing multiple consumers

### 3. Monitoring
Integrate with:
- Prometheus
- Grafana
- DataDog
- New Relic

### 4. Resource Limits
```typescript
// Limit concurrent messages
prefetchCount: 1, // Process one message at a time

// Memory limits
queueOptions: {
  'x-max-length': 10000,
  'x-overflow': 'reject-publish',
}
```

## 🐛 Troubleshooting

### Connection Refused
```bash
# Check RabbitMQ is running
docker ps | grep rabbitmq

# Check logs
docker logs rabbitmq

# Verify port is open
telnet localhost 5672
```

### Messages Not Being Consumed
1. Check consumer is running
2. Verify queue name matches
3. Check for errors in consumer logs
4. Verify message acknowledgment

### High Queue Depth
1. Increase consumer count
2. Optimize consumer processing
3. Add more consumer instances
4. Check for failing consumers

## 📚 Additional Resources

- [RabbitMQ Docs](https://www.rabbitmq.com/documentation.html)
- [NestJS Microservices](https://docs.nestjs.com/microservices/basics)
- [AMQP Protocol](https://www.rabbitmq.com/tutorials/amqp-concepts.html)
- [Best Practices](https://www.rabbitmq.com/best-practices.html)

## 🎯 Next Steps

1. Implement email service for notifications
2. Add SMS gateway integration
3. Create report generation workers
4. Add monitoring and alerting
5. Set up dead letter queues
6. Implement message retry strategy
7. Add metrics collection

---

**Status**: ✅ RabbitMQ Integration Complete

Last Updated: November 3, 2024
