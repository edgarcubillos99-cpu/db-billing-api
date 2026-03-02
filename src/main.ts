import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Configuración global de validaciones (Pipes)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // 2. Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('Records API')
    .setDescription('API para gestionar y consultar millones de registros transaccionales')
    .setVersion('1.0')
    .build();
    
  // 3. Crear el documento y montar la interfaz gráfica
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); // 'api' será la ruta en el navegador

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();