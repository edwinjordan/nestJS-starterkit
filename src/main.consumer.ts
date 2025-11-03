import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const logger = new Logger('RabbitMQ Consumer');
  
  // Create application context to access ConfigService
  const appContext = await NestFactory.createApplicationContext(AppModule);
  const configService = appContext.get(ConfigService);
  
  const rabbitmqUrl = configService.get<string>('rabbitmq.url') || 'amqp://localhost:5672';
  const salesQueue = configService.get<string>('rabbitmq.queues.sales') || 'sales_queue';
  
  logger.log(`Connecting to RabbitMQ at ${rabbitmqUrl}`);
  logger.log(`Listening to queue: ${salesQueue}`);

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.RMQ,
    options: {
      urls: [rabbitmqUrl],
      queue: salesQueue,
      queueOptions: {
        durable: true,
      },
      prefetchCount: 1,
      noAck: false,
    },
  });

  await app.listen();
  logger.log('RabbitMQ Consumer microservice is listening...');
}

bootstrap();
