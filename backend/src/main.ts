import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
  origin: [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "welcoming-alignment-production-92b0.up.railway.app",
    "https://your-custom-domain.com"
  ],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "Accept",
    "Origin",
    "X-Requested-With",
  ],
  credentials: true,
});

  await app.listen(8000, "0.0.0.0");
}

bootstrap();