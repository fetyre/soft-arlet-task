import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './error/global-http-error';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	const httpAdapter = app.get(HttpAdapterHost);
	app.useGlobalFilters(new HttpExceptionFilter(httpAdapter));
	const config = new DocumentBuilder()
		.setTitle('GeoIP Service')
		.setDescription('Сервис для получения информации о геолокации по IP адресу')
		.setVersion('1.0')
		.addTag('geo-info')
		.build();
	const document: OpenAPIObject = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup('api', app, document);
	await app.listen(3000);
}
bootstrap();
