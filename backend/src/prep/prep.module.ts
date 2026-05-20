import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrepMaterial } from './prep-material.entity';
import { UserBookmark } from './user-bookmark.entity';
import { UserPrepProgress } from './user-prep-progress.entity';
import { UserRecentlyViewed } from './user-recently-viewed.entity';
import { PrepController } from './prep.controller';
import { PrepService } from './prep.service';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PrepMaterial, UserBookmark, UserPrepProgress, UserRecentlyViewed]),
    AiModule
  ],
  controllers: [PrepController],
  providers: [PrepService],
  exports: [PrepService],
})
export class PrepModule {}
