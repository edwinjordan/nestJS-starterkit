import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';
import type {
  InventoryUpdatedEvent,
  LowStockEvent,
} from '../rabbitmq/rabbitmq.types';
import { MessagePattern as MsgPattern } from '../rabbitmq/rabbitmq.types';

@Controller()
export class InventoryConsumer {
  private readonly logger = new Logger(InventoryConsumer.name);

  @EventPattern(MsgPattern.INVENTORY_UPDATED)
  async handleInventoryUpdated(@Payload() data: InventoryUpdatedEvent, @Ctx() context: RmqContext) {
    this.logger.log(`Processing inventory update: ${data.itemName} (${data.itemCode})`);
    
    try {
      this.logger.log(
        `Stock changed from ${data.previousStock} to ${data.currentStock} for ${data.itemName}`,
      );
      
      // Check if stock is low
      if (data.currentStock <= data.minStock && data.currentStock > 0) {
        this.logger.warn(
          `Low stock alert: ${data.itemName} has ${data.currentStock} units (min: ${data.minStock})`,
        );
        
        // Could emit another event for low stock notification
      }
      
      // Check if out of stock
      if (data.currentStock === 0) {
        this.logger.error(`Out of stock: ${data.itemName}`);
      }
      
      const channel = context.getChannelRef();
      const originalMsg = context.getMessage();
      channel.ack(originalMsg);
      
      this.logger.log(`Successfully processed inventory update for ${data.itemName}`);
    } catch (error) {
      this.logger.error(`Error processing inventory update: ${error.message}`, error.stack);
      
      const channel = context.getChannelRef();
      const originalMsg = context.getMessage();
      channel.nack(originalMsg, false, true);
    }
  }

  @EventPattern(MsgPattern.INVENTORY_LOW_STOCK)
  async handleLowStock(@Payload() data: LowStockEvent, @Ctx() context: RmqContext) {
    this.logger.warn(`Low stock alert: ${data.itemName} (${data.itemCode})`);
    
    try {
      this.logger.log(`Current stock: ${data.currentStock}, Min stock: ${data.minStock}`);
      
      // Example: Send email to procurement team
      this.logger.log(`Sending low stock notification to procurement for ${data.itemName}`);
      
      // Example: Create purchase order suggestion
      const suggestedReorderQty = data.reorderLevel - data.currentStock;
      this.logger.log(`Suggested reorder quantity: ${suggestedReorderQty} units`);
      
      const channel = context.getChannelRef();
      const originalMsg = context.getMessage();
      channel.ack(originalMsg);
      
      this.logger.log(`Successfully processed low stock alert for ${data.itemName}`);
    } catch (error) {
      this.logger.error(`Error processing low stock alert: ${error.message}`, error.stack);
      
      const channel = context.getChannelRef();
      const originalMsg = context.getMessage();
      channel.nack(originalMsg, false, true);
    }
  }

  @EventPattern(MsgPattern.INVENTORY_OUT_OF_STOCK)
  async handleOutOfStock(@Payload() data: any, @Ctx() context: RmqContext) {
    this.logger.error(`Out of stock alert: ${data.itemName} (${data.itemCode})`);
    
    try {
      // Example: Send urgent notification
      this.logger.log(`Sending urgent out-of-stock notification for ${data.itemName}`);
      
      // Example: Disable item for sale
      this.logger.log(`Disabling ${data.itemName} from available items`);
      
      const channel = context.getChannelRef();
      const originalMsg = context.getMessage();
      channel.ack(originalMsg);
      
      this.logger.log(`Successfully processed out-of-stock alert for ${data.itemName}`);
    } catch (error) {
      this.logger.error(`Error processing out-of-stock alert: ${error.message}`, error.stack);
      
      const channel = context.getChannelRef();
      const originalMsg = context.getMessage();
      channel.nack(originalMsg, false, true);
    }
  }
}
