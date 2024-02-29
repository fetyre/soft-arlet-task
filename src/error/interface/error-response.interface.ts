import { IErrorPointer } from './error-pointer.interface';

/**
 * @interface IErrorResponse
 * @description Интерфейс ответа на ошибку
 * @property {number} status - Статус HTTP ответа
 * @property {IErrorPointer} [source] - Указатель на источник ошибки
 * @property {string} title - Название ошибки
 * @property {string | object} detail - Детальное описание ошибки
 */
export interface IErrorResponse {
	status: number;
	source?: IErrorPointer;
	title: string;
	detail: string | object;
}
