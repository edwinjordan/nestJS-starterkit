import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RabbitMQService } from './rabbitmq.service';
import rabbitmqConfig from '../config/rabbitmq.config';

@Global()
@Module({
  imports: [
    ConfigModule.forFeature(rabbitmqConfig),
  ],
  providers: [RabbitMQService],
  exports: [RabbitMQService],
})
export class RabbitMQModule {}
