import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';
import type {
  EmailNotificationEvent,
} from '../rabbitmq/rabbitmq.types';
import { MessagePattern as MsgPattern } from '../rabbitmq/rabbitmq.types';

@Controller()
export class NotificationConsumer {
  private readonly logger = new Logger(NotificationConsumer.name);

  @EventPattern(MsgPattern.NOTIFICATION_EMAIL)
  async handleEmailNotification(
    @Payload() data: EmailNotificationEvent,
    @Ctx() context: RmqContext,
  ) {
    this.logger.log(`Processing email notification to: ${data.to}`);
    
    try {
      // Example: Send actual email using nodemailer or similar service
      this.logger.log(`Sending email: ${data.subject}`);
      this.logger.log(`Template: ${data.template}`);
      this.logger.log(`Data:`, data.data);
      
      // Simulate email sending
      await this.sendEmail(data);
      
      const channel = context.getChannelRef();
      const originalMsg = context.getMessage();
      channel.ack(originalMsg);
      
      this.logger.log(`Successfully sent email to ${data.to}`);
    } catch (error) {
      this.logger.error(`Error sending email: ${error.message}`, error.stack);
      
      const channel = context.getChannelRef();
      const originalMsg = context.getMessage();
      channel.nack(originalMsg, false, true);
    }
  }

  @EventPattern(MsgPattern.NOTIFICATION_SMS)
  async handleSmsNotification(@Payload() data: any, @Ctx() context: RmqContext) {
    this.logger.log(`Processing SMS notification to: ${data.phone}`);
    
    try {
      // Example: Send SMS using Twilio or similar service
      this.logger.log(`Sending SMS: ${data.message}`);
      
      const channel = context.getChannelRef();
      const originalMsg = context.getMessage();
      channel.ack(originalMsg);
      
      this.logger.log(`Successfully sent SMS to ${data.phone}`);
    } catch (error) {
      this.logger.error(`Error sending SMS: ${error.message}`, error.stack);
      
      const channel = context.getChannelRef();
      const originalMsg = context.getMessage();
      channel.nack(originalMsg, false, true);
    }
  }

  @EventPattern(MsgPattern.NOTIFICATION_SYSTEM)
  async handleSystemNotification(@Payload() data: any, @Ctx() context: RmqContext) {
    this.logger.log(`Processing system notification for user: ${data.userId}`);
    
    try {
      // Example: Create in-app notification
      this.logger.log(`Creating notification: ${data.title}`);
      this.logger.log(`Message: ${data.message}`);
      
      // Save to database or notification service
      
      const channel = context.getChannelRef();
      const originalMsg = context.getMessage();
      channel.ack(originalMsg);
      
      this.logger.log(`Successfully created system notification for user ${data.userId}`);
    } catch (error) {
      this.logger.error(`Error creating system notification: ${error.message}`, error.stack);
      
      const channel = context.getChannelRef();
      const originalMsg = context.getMessage();
      channel.nack(originalMsg, false, true);
    }
  }

  private async sendEmail(data: EmailNotificationEvent): Promise<void> {
    // Simulate email sending delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // In production, use nodemailer or email service:
    /*
    const transporter = nodemailer.createTransporter({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: data.to,
      subject: data.subject,
      html: renderTemplate(data.template, data.data),
    });
    */
    
    this.logger.debug(`Email sent successfully to ${data.to}`);
  }
}
