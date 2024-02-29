import {
	ExceptionFilter,
	Catch,
	ArgumentsHost,
	HttpException,
	HttpStatus
} from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { HttpAdapterHost } from '@nestjs/core';
import { IErrorResponse } from './interface/error-response.interface';
import { STATUS_CODES } from 'http';

/**
 * @description Дефолтное сообщение ошибки
 */
const DEFAULT_ERROR_MESSAGE: string = 'Ошибка севрера';

/**
 * @description Дефолтный код ошибки
 */
const DEFAULT_ERROR_CODE: number = HttpStatus.INTERNAL_SERVER_ERROR;

/**
 * @description Дефолтный URL запроса
 */
const DEFAULT_REQUEST_URL: string = 'Unknown request';

/**
 * @description Дефолтное название ошибки
 */
const DEFAULT_ERROR_TITLE: string = 'Error';

/**
 * @class HttpExceptionFilter
 * @description Фильтр исключений для обработки исключений
 * @implements {ExceptionFilter}
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
	constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

	/**
	 * @class HttpExceptionFilter
	 * @description Фильтр исключений для обработки исключений, возникающих во время выполнения HTTP запросов
	 * @implements {ExceptionFilter}
	 */
	catch(exception: unknown, host: ArgumentsHost): void {
		const { httpAdapter } = this.httpAdapterHost;
		const ctx: HttpArgumentsHost = host.switchToHttp();
		const requestUrl: string =
			host?.switchToHttp()?.getRequest()?.url || DEFAULT_REQUEST_URL;
		const httpStatus: number = this.extractStatus(exception);
		const errorTitle: string = STATUS_CODES[httpStatus] || DEFAULT_ERROR_TITLE;
		const message: string | object = this.extractErrorMessage(exception);
		const errorBody = this.createResponseBody(
			httpStatus,
			message,
			errorTitle,
			requestUrl
		);
		httpAdapter.reply(ctx.getResponse(), errorBody, httpStatus);
	}

	/**
	 * @method createResponseBody
	 * @description Создает тело ответа, содержащее информацию об ошибке
	 * @param {number} status - Статус ответа
	 * @param {string | object} message - Сообщение об ошибке
	 * @param {string} title - Название ошибки
	 * @param {string} [requestUrl] - URL запроса
	 * @returns {IErrorResponse} Тело ответа(полыне данные об ошибке)
	 */
	private createResponseBody(
		status: number,
		message: string | object,
		title: string,
		requestUrl?: string
	): IErrorResponse {
		return {
			status,
			source: { pointer: requestUrl },
			title,
			detail: message
		};
	}

	/**
	 * @method extractErrorMessage
	 * @description Извлекает сообщение об ошибке из исключения
	 * @param {unknown} exception - Исключение из которого нужно извлечь сообщение об ошибке
	 * @returns {string | object} Сообщение об ошибке
	 */
	private extractErrorMessage(exception: unknown): string | object {
		return exception instanceof HttpException
			? exception.getResponse()
			: DEFAULT_ERROR_MESSAGE;
	}

	/**
	 * @method extractStatus
	 * @description Извлекает статус ответа из исключения
	 * @param {unknown} exception - Исключение из которого нужно извлечь статус ответа
	 * @returns {number} Статус ответа
	 */
	private extractStatus(exception: unknown): number {
		return exception instanceof HttpException
			? exception.getStatus()
			: DEFAULT_ERROR_CODE;
	}
}
