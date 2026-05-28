import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrepMaterial } from './prep-material.entity';
import { UserBookmark } from './user-bookmark.entity';
import { UserPrepProgress } from './user-prep-progress.entity';
import { UserRecentlyViewed } from './user-recently-viewed.entity';
import { PrepController } from './prep.controller';
import { PrepService } from './prep.service';
import { AiModule } from '../ai/ai.module';
import { ChatbotModule } from '../chatbot/chatbot.module';
import { QueueModule } from '../queue/queue.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PrepMaterial, UserBookmark, UserPrepProgress, UserRecentlyViewed]),
    AiModule,
    ChatbotModule,
    QueueModule,
  ],
  controllers: [PrepController],
  providers: [PrepService],
  exports: [PrepService],
})
export class PrepModule {}
