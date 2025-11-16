import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MessagePattern } from './rabbitmq.types';
import * as amqp from 'amqp-connection-manager';
import type { ChannelWrapper } from 'amqp-connection-manager';
import type { ConfirmChannel } from 'amqplib';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitMQService.name);
  private connection: amqp.AmqpConnectionManager;
  private channelWrapper: ChannelWrapper;
  private isConnected = false;

  constructor(
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    try {
      const url = this.configService.get<string>('rabbitmq.url') || 'amqp://admin:admin@localhost:5672';
      const exchange = this.configService.get<string>('rabbitmq.exchange') || 'erp_exchange';

      this.logger.log(`Connecting to RabbitMQ: ${url.replace(/\/\/.*@/, '//***@')}`);

      // Create connection
      this.connection = amqp.connect([url], {
        heartbeatIntervalInSeconds: 60,
        reconnectTimeInSeconds: 5,
      });

      this.connection.on('connect', () => {
        this.isConnected = true;
        this.logger.log('Successfully connected to RabbitMQ');
      });

      this.connection.on('disconnect', (params) => {
        this.isConnected = false;
        this.logger.warn('Disconnected from RabbitMQ', params?.err?.message);
      });

      // Create channel
      this.channelWrapper = this.connection.createChannel({
        setup: async (channel: ConfirmChannel) => {
          // Assert exchange
          await channel.assertExchange(exchange, 'topic', {
            durable: true,
          });

          // Assert queues
          const queues = this.configService.get<any>('rabbitmq.queues') || {};
          for (const [key, queueName] of Object.entries(queues)) {
            if (typeof queueName === 'string') {
              await channel.assertQueue(queueName, {
                durable: true,
              });
              // Bind queue to exchange with routing key pattern
              await channel.bindQueue(queueName, exchange, `${key}.#`);
              this.logger.debug(`Queue "${queueName}" bound to exchange "${exchange}" with pattern "${key}.#"`);
            }
          }

          this.logger.log('RabbitMQ channel setup completed');
        },
      });

      await this.channelWrapper.waitForConnect();
      this.logger.log('RabbitMQ channel ready');

    } catch (error) {
      this.logger.error('Failed to initialize RabbitMQ', error);
      // Don't throw - app can work without RabbitMQ
    }
  }

  async onModuleDestroy() {
    try {
      if (this.channelWrapper) {
        await this.channelWrapper.close();
      }
      if (this.connection) {
        await this.connection.close();
      }
      this.logger.log('RabbitMQ connection closed');
    } catch (error) {
      this.logger.error('Error closing RabbitMQ connection', error);
    }
  }

  /**
   * Emit an event to RabbitMQ (fire-and-forget, no reply expected)
   * @param pattern Message pattern/routing key
   * @param data Event data
   */
  async emit<T = any>(pattern: MessagePattern | string, data: T): Promise<void> {
    if (!this.isConnected || !this.channelWrapper) {
      this.logger.warn(`Cannot emit event: ${pattern} - RabbitMQ not connected`);
      return;
    }

    try {
      const exchange = this.configService.get<string>('rabbitmq.exchange') || 'erp_exchange';
      const routingKey = String(pattern);

      await this.channelWrapper.publish(exchange, routingKey, Buffer.from(JSON.stringify(data)), {
        persistent: true,
        contentType: 'application/json',
        timestamp: Date.now(),
      });

      this.logger.debug(`Event emitted: ${pattern} to exchange "${exchange}"`);
    } catch (error) {
      this.logger.error(`Failed to emit event: ${pattern}`, error);
      // Don't throw - we don't want to break the main flow for async events
    }
  }

  /**
   * Publish directly to a specific queue
   * @param queueName Queue name
   * @param data Message data
   */
  async publishToQueue<T = any>(queueName: string, data: T): Promise<void> {
    if (!this.isConnected || !this.channelWrapper) {
      this.logger.warn(`Cannot publish to queue: ${queueName} - RabbitMQ not connected`);
      return;
    }

    try {
      await this.channelWrapper.sendToQueue(queueName, Buffer.from(JSON.stringify(data)), {
        persistent: true,
        contentType: 'application/json',
        timestamp: Date.now(),
      });

      this.logger.debug(`Message published to queue: ${queueName}`);
    } catch (error) {
      this.logger.error(`Failed to publish to queue: ${queueName}`, error);
    }
  }

  /**
   * Check if RabbitMQ is connected
   */
  isReady(): boolean {
    return this.isConnected;
  }

  /**
   * Get channel wrapper for advanced usage
   */
  getChannel(): ChannelWrapper | null {
    return this.channelWrapper || null;
  }
}
