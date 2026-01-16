import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const PORT = process.env.PORT || 3003;

  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      if (
        origin.startsWith('http://localhost:') ||
        origin.startsWith('http://127.0.0.1:')
      ) {
        return callback(null, true);
      }

      if (origin.endsWith('.vercel.app')) {
        return callback(null, true);
      }

      if (
        origin === 'https://fomohub.com.br' ||
        origin === 'https://www.fomohub.com.br'
      ) {
        return callback(null, true);
      }

      console.error('❌ CORS blocked origin:', origin);
      return callback(new Error('Not allowed by CORS'), false);
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  await app.listen(PORT);
  console.log(`🚀 API running on port ${PORT}`);
}

bootstrap();
