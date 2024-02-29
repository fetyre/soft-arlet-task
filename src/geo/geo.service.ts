import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import * as geoip from 'geoip-lite';
import { IGeolocation } from './interface/geo-location.interface';
import { ErrorHandlerService } from '../errro-catch/error-catch.service';

/**
 * @description Регулярное выражение для проверки формата IP (IPv4 и IPv6)
 */
const ipRegex: RegExp =
	/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$|^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;

/**
 * @description  Значение по умолчанию
 */
const EMPTY_STRING: string = '';

/**
 * @description Индекс для широты в массиве координат
 */
const LAT_INDEX: number = 0;

/**
 * @description Индекс для долготы в массиве координат
 */
const LNG_INDEX: number = 1;

/**
 * @class GeoService
 * @description Сервис для получения геолокации по IP-адресу.
 * @see {@link getGeolocation} Метод для получения информации о геолокации по IP-адресу.
 */
@Injectable()
export class GeoService {
	private readonly logger: Logger = new Logger(GeoService.name);

	constructor(private readonly errorHandlerService: ErrorHandlerService) {}

	/**
	 * @public
	 * @method getGeolocation
	 * @description Получает информацию о геолокации по IP адресу
	 * @param {string | undefined} ip - IP адрес для которого нужно получить информацию о геолокации
	 * @returns {IGeolocation} Информация о геолокации
	 * @throws {HttpException} Если произошла ошибка при выполнении запроса
	 */
	public getGeolocation(ip: string | undefined): IGeolocation {
		try {
			this.logger.log(`getGeolocation: Starting process, ip:${ip}`);
			this.validateIpFormat(ip);
			const geo: geoip.Lookup | null = geoip.lookup(ip);
			this.handleMissingGeoData(geo);
			return this.createGeolocationData(geo);
		} catch (error) {
			this.logger.error(
				`getGeolocation: Error in process, ip:${ip}, error:${error.message}`
			);
			this.errorHandlerService.handleError(error);
		}
	}

	/**
	 * @private
	 * @method createGeolocationData
	 * @description Создает объект с информацией о геолокации
	 * @param {geoip.Lookup} geo - Информация о геолокации
	 * @returns {IGeolocation} Нужная инфомарция о геолокации
	 */
	private createGeolocationData(geo: geoip.Lookup): IGeolocation {
		this.logger.log(`createGeolocationData: Starting process.`);
		return {
			lat: geo.ll?.[LAT_INDEX]?.toString() || EMPTY_STRING,
			lng: geo.ll?.[LNG_INDEX]?.toString() || EMPTY_STRING,
			country: geo.country || EMPTY_STRING,
			city: geo.city || EMPTY_STRING
		};
	}

	/**
	 * @private
	 * @method handleMissingGeoData
	 * @description Проверкка наличия данных о геолокации
	 * @param {geoip.Lookup | null} geo - Информация о геолокации или null(если данные не найденны)
	 * @throws {NotFoundException} Если данных о геолокации нет
	 */
	private handleMissingGeoData(geo: geoip.Lookup | null): void {
		this.logger.log(
			`handleMissingGeoData: Starting process, ip state:${!!geo}`
		);
		if (!geo) {
			this.logger.warn('handleMissingGeoData: No data for this IP');
			throw new HttpException('Нет данных по этому ip', HttpStatus.NOT_FOUND);
		}
	}

	/**
	 * @private
	 * @method validateIpFormat
	 * @description Проверяет формат IP адреса
	 * @param {string} ip - IP адрес который нужно проверить
	 * @throws {BadRequestException} Если формат IP адреса не прошел проверку
	 */
	private validateIpFormat(ip: string): void {
		this.logger.log(`validateIpFormat: Starting process, ip:${ip}`);
		const isValidIP: boolean = ipRegex.test(ip);
		this.logger.debug(`handleMissingGeoData: , isValidIP:${isValidIP}`);
		if (!isValidIP) {
			this.logger.warn('validateIpFormat: Invalid IP format');
			throw new HttpException('Ошибка формата ip', HttpStatus.BAD_REQUEST);
		}
	}
}
