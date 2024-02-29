import { Module } from '@nestjs/common';
import { GeoModule } from './geo/geo.module';
import { ErrorHandlerModule } from './errro-catch/error-catch.module';

@Module({
	imports: [GeoModule, ErrorHandlerModule]
})
export class AppModule {}
