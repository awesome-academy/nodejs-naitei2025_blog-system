import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { TransformInterceptor } from './common/interceptors/response.interceptor';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // whitelist loại bỏ các field không được định nghĩa trong DTO
      forbidNonWhitelisted: true, // forbidNonWhitelisted: true sẽ ném lỗi nếu có field không được định nghĩa trong DTO
      transform: true, // tự động chuyển đổi payload thành object DTO tương ứng
      // stopAtFirstError: true, // dừng việc validate ngay khi gặp lỗi đầu tiên
      transformOptions: { enableImplicitConversion: true }, // cho phép chuyển đổi kiểu dữ liệu ngầm định, ex: string to number
    }),
  );

  app.useGlobalInterceptors(new TransformInterceptor());

  app.useGlobalFilters(new AllExceptionsFilter());

  app.setGlobalPrefix('api');

  const configService = new ConfigService();
  const port = configService.get<number>('PORT') || 3000;

  await app.listen(port);
}
bootstrap();
