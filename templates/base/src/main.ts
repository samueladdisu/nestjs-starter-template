import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  const configService = app.get(ConfigService);
  app.setGlobalPrefix('api');
  const port = configService.get<string>('port') || 3000;
  const mongoUri = configService.get<string>('mongoUri');
  await app.listen(port);
  console.log(`Server is running on port ${port}`);
  console.log(`MongoDB is running on ${mongoUri}`);
}
bootstrap();
