import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';
import type {
  SaleCreatedEvent,
  InventoryUpdatedEvent,
  LowStockEvent,
  EmailNotificationEvent,
} from '../rabbitmq/rabbitmq.types';
import { MessagePattern as MsgPattern } from '../rabbitmq/rabbitmq.types';

@Controller()
export class SalesConsumer {
  private readonly logger = new Logger(SalesConsumer.name);

  @EventPattern(MsgPattern.SALE_CREATED)
  async handleSaleCreated(@Payload() data: SaleCreatedEvent, @Ctx() context: RmqContext) {
    this.logger.log(`Processing sale created event: ${data.invoiceNumber}`);
    
    try {
      // Example: Send confirmation email
      this.logger.log(`Sending confirmation email for sale ${data.invoiceNumber}`);
      
      // Example: Update analytics
      this.logger.log(`Updating sales analytics for ${data.invoiceNumber}`);
      
      // Example: Trigger invoice generation
      this.logger.log(`Generating invoice PDF for ${data.invoiceNumber}`);
      
      // Acknowledge the message
      const channel = context.getChannelRef();
      const originalMsg = context.getMessage();
      channel.ack(originalMsg);
      
      this.logger.log(`Successfully processed sale created: ${data.invoiceNumber}`);
    } catch (error) {
      this.logger.error(`Error processing sale created: ${error.message}`, error.stack);
      
      // Reject and requeue the message for retry
      const channel = context.getChannelRef();
      const originalMsg = context.getMessage();
      channel.nack(originalMsg, false, true);
    }
  }

  @EventPattern(MsgPattern.SALE_CANCELLED)
  async handleSaleCancelled(@Payload() data: any, @Ctx() context: RmqContext) {
    this.logger.log(`Processing sale cancelled event: ${data.invoiceNumber}`);
    
    try {
      // Example: Restore inventory
      this.logger.log(`Restoring inventory for cancelled sale ${data.invoiceNumber}`);
      
      // Example: Send cancellation notification
      this.logger.log(`Sending cancellation notification for ${data.invoiceNumber}`);
      
      const channel = context.getChannelRef();
      const originalMsg = context.getMessage();
      channel.ack(originalMsg);
      
      this.logger.log(`Successfully processed sale cancellation: ${data.invoiceNumber}`);
    } catch (error) {
      this.logger.error(`Error processing sale cancellation: ${error.message}`, error.stack);
      
      const channel = context.getChannelRef();
      const originalMsg = context.getMessage();
      channel.nack(originalMsg, false, true);
    }
  }
}
