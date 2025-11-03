import { Module } from '@nestjs/common';
import { SalesConsumer } from './sales.consumer';
import { InventoryConsumer } from './inventory.consumer';
import { NotificationConsumer } from './notification.consumer';
import { RabbitMQModule } from '../rabbitmq/rabbitmq.module';

@Module({
  imports: [RabbitMQModule],
  controllers: [SalesConsumer, InventoryConsumer, NotificationConsumer],
})
export class ConsumersModule {}
