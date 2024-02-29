import axios, { AxiosResponse } from 'axios';
import { IGeolocation } from '../geo/interface/geo-location.interface';

// этот класс создает geo ddk proxy и другие могут его использовать

/**
 * @class GeoSDK
 * @description Класс для работы с веб-сервисом геолокации.
 * @see {@link getGeoInfo} Метод для получения информации о геолокации по IP-адресу.
 */
export class GeoSDK {
	private readonly baseUrl: string = 'http://localhost:3000';

	/**
	 * @public
	 * @method getGeoInfo
	 * @description Отправляет запрос к веб-сервису геолокации и возвращает информацию о геолокации.
	 * @param {string} ip - IP-адрес, для которого нужно получить информацию о геолокации.
	 * @returns {Promise<IGeolocation>} Объект с информацией о геолокации.
	 * @throws {Error} Если произошла ошибка при выполнении запроса.
	 */
	async getGeoInfo(ip: string): Promise<IGeolocation> {
		try {
			const response: AxiosResponse<IGeolocation> = await axios.get(
				`${this.baseUrl}/?ip=${ip}`
			);
			return response.data;
		} catch (error) {
			throw error;
		}
	}
}
