import { Module, forwardRef } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AiModule } from '../ai/ai.module';
import { QUEUE_NAMES } from './queue.constants';
import { QueueService } from './queue.service';
import { QueueController } from './queue.controller';
import { AiEvaluationProcessor } from './processors/ai-evaluation.processor';
import { AiPrepProcessor } from './processors/ai-prep.processor';
import { ChatbotModule } from '../chatbot/chatbot.module';

@Module({
  imports: [
    /**
     * Register BullMQ with Redis using environment variables.
     *
     * Required env vars:
     *   REDIS_HOST  (default: localhost)
     *   REDIS_PORT  (default: 6379)
     *   REDIS_PASSWORD (optional)
     *
     * For cloud Redis (e.g. Railway, Upstash, Redis Cloud)
     * set REDIS_URL as a full connection string instead and adjust below.
     */
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => {
        const redisUrl = config.get<string>('REDIS_URL');

        // If a full REDIS_URL is provided (e.g. redis://user:pass@host:port)
        if (redisUrl) {
          return { connection: { url: redisUrl } };
        }

        // Otherwise use individual host/port/password env vars
        return {
          connection: {
            host:     config.get<string>('REDIS_HOST', 'localhost'),
            port:     config.get<number>('REDIS_PORT', 6379),
            password: config.get<string>('REDIS_PASSWORD') || undefined,
          },
        };
      },
      inject: [ConfigService],
    }),

    // Register the two named queues
    BullModule.registerQueue(
      { name: QUEUE_NAMES.AI_EVALUATION },
      { name: QUEUE_NAMES.AI_EXPLANATION },
    ),

    // Import AiModule so processors can inject AiService
    AiModule,
    forwardRef(() => ChatbotModule),
  ],
  controllers: [QueueController],
  providers: [
    QueueService,
    AiEvaluationProcessor,
    AiPrepProcessor,
  ],
  exports: [QueueService],
})
export class QueueModule {}
