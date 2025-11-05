import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from './configs/logger.config';
import { LoggingInterceptor } from './common/interceptors/log.interceptor';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { BadRequestException, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  
  const app = await NestFactory.create(AppModule, {
      logger: WinstonModule.createLogger(winstonConfig)
  });

  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new ResponseInterceptor()
  ) 

  app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      stopAtFirstError: true,
      transform: false,
      transformOptions: { enableImplicitConversion: false },
      exceptionFactory: (errors) => {
          const firstError = errors[0].constraints;
          const ErrorMessage = firstError ? Object.values(firstError): "Validation Fails";
          return new BadRequestException(ErrorMessage);
      }
   }))

  await app.listen(process.env.PORT ?? 3000);

}


bootstrap();
