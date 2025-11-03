import { Injectable, Inject, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { MessagePattern } from './rabbitmq.types';

@Injectable()
export class RabbitMQService {
  private readonly logger = new Logger(RabbitMQService.name);

  constructor(
    @Inject('RABBITMQ_SERVICE') private readonly client: ClientProxy,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    try {
      await this.client.connect();
      this.logger.log('Successfully connected to RabbitMQ');
    } catch (error) {
      this.logger.error('Failed to connect to RabbitMQ', error);
    }
  }

  async onModuleDestroy() {
    await this.client.close();
    this.logger.log('RabbitMQ connection closed');
  }

  /**
   * Emit an event to RabbitMQ
   * @param pattern Message pattern/routing key
   * @param data Event data
   */
  async emit<T = any>(pattern: MessagePattern | string, data: T): Promise<void> {
    try {
      this.client.emit(pattern, data);
      this.logger.debug(`Event emitted: ${pattern}`, { data });
    } catch (error) {
      this.logger.error(`Failed to emit event: ${pattern}`, error);
      throw error;
    }
  }

  /**
   * Send a message and wait for response
   * @param pattern Message pattern
   * @param data Message data
   * @returns Observable with response
   */
  send<TResult = any, TInput = any>(pattern: MessagePattern | string, data: TInput) {
    try {
      this.logger.debug(`Sending message: ${pattern}`, { data });
      return this.client.send<TResult, TInput>(pattern, data);
    } catch (error) {
      this.logger.error(`Failed to send message: ${pattern}`, error);
      throw error;
    }
  }

  /**
   * Publish event to specific queue
   * @param queue Queue name
   * @param pattern Message pattern
   * @param data Event data
   */
  async publishToQueue<T = any>(
    queue: string,
    pattern: MessagePattern | string,
    data: T,
  ): Promise<void> {
    try {
      this.client.emit(pattern, { queue, data });
      this.logger.debug(`Published to queue ${queue}: ${pattern}`, { data });
    } catch (error) {
      this.logger.error(`Failed to publish to queue ${queue}: ${pattern}`, error);
      throw error;
    }
  }
}
