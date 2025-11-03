import { Module, Global } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RabbitMQService } from './rabbitmq.service';
import rabbitmqConfig from '../config/rabbitmq.config';

@Global()
@Module({
  imports: [
    ConfigModule.forFeature(rabbitmqConfig),
    ClientsModule.registerAsync([
      {
        name: 'RABBITMQ_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => {
          const url = configService.get<string>('rabbitmq.url') || 'amqp://localhost:5672';
          const queue = configService.get<string>('rabbitmq.queues.sales') || 'sales_queue';
          
          return {
            transport: Transport.RMQ,
            options: {
              urls: [url],
              queue,
              queueOptions: {
                durable: true,
              },
              prefetchCount: 1,
              noAck: false,
            },
          };
        },
        inject: [ConfigService],
      },
    ]),
  ],
  providers: [RabbitMQService],
  exports: [RabbitMQService, ClientsModule],
})
export class RabbitMQModule {}
