import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conversation } from './conversation.entity';
import { MockResult } from './mock-result.entity';
import { ChatbotService } from './chatbot.service';
import { ChatbotController } from './chatbot.controller';
import { InterviewService } from './interview.service';
import { InterviewController } from './interview.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Conversation, MockResult])],
  providers: [ChatbotService, InterviewService],
  controllers: [ChatbotController, InterviewController],
})
export class ChatbotModule {}
