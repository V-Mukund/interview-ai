import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ChatbotModule } from './chatbot/chatbot.module';
import { AiModule } from './ai/ai.module';
import { PrepModule } from './prep/prep.module';
import { QueueModule } from './queue/queue.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    CacheModule.register({
      isGlobal: true,
      ttl: 60,   // default short TTL of 60 seconds
      max: 200,  // max 200 items in memory to be lightweight
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../.env',
    }),
  TypeOrmModule.forRoot({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  autoLoadEntities: true,
  synchronize: true,
  ssl:
    process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : false,
}),
    AuthModule,
    UsersModule,
    ChatbotModule,
    AiModule,
    PrepModule,
    QueueModule,  // ← BullMQ background job queues
  ],
  controllers: [AppController],
})
export class AppModule {}
