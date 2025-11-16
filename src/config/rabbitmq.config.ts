import { registerAs } from '@nestjs/config';

export default registerAs('rabbitmq', () => ({
  url: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
  queues: {
    sales: process.env.RABBITMQ_QUEUE_SALES || 'sales_queue',
    inventory: process.env.RABBITMQ_QUEUE_INVENTORY || 'inventory_queue',
    notifications: process.env.RABBITMQ_QUEUE_NOTIFICATIONS || 'notifications_queue',
  },
  exchange: process.env.RABBITMQ_EXCHANGE || 'erp_exchange',
}));
