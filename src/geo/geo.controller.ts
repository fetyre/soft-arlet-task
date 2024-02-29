import { Controller, Get, HttpStatus, Query, Res } from '@nestjs/common';
import {
	ApiTags,
	ApiOperation,
	ApiQuery,
	ApiResponse,
	ApiNotFoundResponse,
	ApiBadRequestResponse
} from '@nestjs/swagger';
import { GeoService } from './geo.service';
import { Response } from 'express';
import { IGeolocation } from './interface/geo-location.interface';

@ApiTags('Geo')
@Controller('/')
export class GeoController {
	constructor(private readonly geoService: GeoService) {}

	@Get()
	@ApiOperation({ summary: 'Получить информацию о геолокации по IP адресу' })
	@ApiQuery({ name: 'ip', required: true, description: 'IP адрес' })
	@ApiResponse({
		status: 200,
		description: 'Успешное получение данных о геолокации',
		schema: {
			type: 'object',
			properties: {
				lat: { type: 'string', description: 'Широта' },
				lng: { type: 'string', description: 'Долгота' },
				country: { type: 'string', description: 'Страна' },
				city: { type: 'string', description: 'Город' }
			}
		}
	})
	@ApiBadRequestResponse({ description: 'Неверный формат ip адреса' })
	@ApiNotFoundResponse({
		description: 'Данные геолокации не найдены для данного IP'
	})
	getGeoInfo(@Query('ip') ip: string, @Res() res: Response) {
		const geoData: IGeolocation = this.geoService.getGeolocation(ip);
		res.status(HttpStatus.OK).json(geoData);
	}
}
