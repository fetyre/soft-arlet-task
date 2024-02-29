/**
 * @interface IGeolocation
 * @description Информация о геолокации
 * @property {string} lat - Широта
 * @property {string} lng - Долгота
 * @property {string} country - Страна
 * @property {string} city - Город
 */
export interface IGeolocation {
	lat: string;
	lng: string;
	country: string;
	city: string;
}
