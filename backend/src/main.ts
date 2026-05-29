// import { NestFactory } from "@nestjs/core";
// import { AppModule } from "./app.module";

// async function bootstrap() {
//   const app = await NestFactory.create(AppModule);

//   app.enableCors({
//     origin: (origin, callback) => {
//       console.log(`[CORS] Incoming request from origin: ${origin || 'none (direct/same-origin)'}`);
//       callback(null, true);
//     },
//     methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
//     allowedHeaders: [
//       "Content-Type",
//       "Authorization",
//       "Accept",
//       "Origin",
//       "X-Requested-With",
//     ],
//     credentials: true,
//   });

//   await app.listen(process.env.PORT || 8000, "0.0.0.0");
// }

// bootstrap();
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: true,
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

  const port = process.env.PORT || 8000;
  await app.listen(port, "0.0.0.0");

  console.log(`Backend running on port ${port}`);
}

bootstrap();