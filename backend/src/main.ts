// import { NestFactory } from "@nestjs/core";
// import { AppModule } from "./app.module";

// async function bootstrap() {
//   const app = await NestFactory.create(AppModule);

//   app.enableCors({
//     origin: (origin, callback) => {
//       if (!origin) {
//         callback(null, true);
//         return;
//       }
//       const isLocalhost = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
//       const isProduction = origin === "https://welcoming-alignment-production-92b0.up.railway.app";
      
//       if (isLocalhost || isProduction) {
//         callback(null, true);
//       } else {
//         callback(new Error("Not allowed by CORS"));
//       }
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

  await app.listen(process.env.PORT || 8000, "0.0.0.0");
}

bootstrap();