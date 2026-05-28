import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conversation } from './conversation.entity';
import { MockResult } from './mock-result.entity';
import { ChatbotService } from './chatbot.service';
import { ChatbotController } from './chatbot.controller';
import { InterviewService } from './interview.service';
import { InterviewController } from './interview.controller';
import { DashboardController } from './dashboard.controller';
import { QueueModule } from '../queue/queue.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Conversation, MockResult]),
    forwardRef(() => QueueModule),
  ],
  providers: [ChatbotService, InterviewService],
  controllers: [ChatbotController, InterviewController, DashboardController],
  exports: [InterviewService],
})
export class ChatbotModule {}
