import { Test, TestingModule } from '@nestjs/testing';
import * as geoip from 'geoip-lite';
import { GeoService } from '../geo.service';
import { ErrorHandlerService } from '../../errro-catch/error-catch.service';
import { IGeolocation } from '../interface/geo-location.interface';

describe('GeoService', () => {
	let service: GeoService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				GeoService,
				{
					provide: ErrorHandlerService,
					useValue: {
						handleError: jest.fn().mockImplementation(error => {
							throw error;
						})
					}
				}
			]
		}).compile();

		service = module.get<GeoService>(GeoService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	describe('getGeolocation', () => {
		it('should return geolocation data for valid IP v4', () => {
			const ip: string = '66.249.68.102';
			const geoData: geoip.Lookup = geoip.lookup(ip);
			const result: IGeolocation = service.getGeolocation(ip);
			expect(result).toEqual({
				lat: geoData.ll[0].toString(),
				lng: geoData.ll[1].toString(),
				country: geoData.country,
				city: geoData.city
			});
		});

		it('should return geolocation data for valid IP v6', () => {
			const ip: string = '2607:f0d0:1002:0051:0000:0000:0000:0004';
			const geoData: geoip.Lookup = geoip.lookup(ip);
			const result: IGeolocation = service.getGeolocation(ip);
			expect(result).toEqual({
				lat: geoData.ll[0].toString(),
				lng: geoData.ll[1].toString(),
				country: geoData.country,
				city: geoData.city
			});
		});

		it('should return mock geolocation data for a valid IP v6', () => {
			const ip: string = '2607:f0d0:1002:0051:0000:0000:0000:0004';
			const mockData: geoip.Lookup = {
				range: [0, 0],
				country: '',
				region: '',
				city: '',
				ll: [0, 0],
				metro: 0,
				area: 0,
				eu: '0',
				timezone: ''
			};
			jest.spyOn(geoip, 'lookup').mockReturnValue(mockData);
			const result: IGeolocation = service.getGeolocation(ip);
			expect(result).toEqual({
				lat: mockData.ll[0].toString(),
				lng: mockData.ll[1].toString(),
				country: mockData.country,
				city: mockData.city
			});
		});

		it('should throw an error when geoip.lookup fails', () => {
			const ip: string = '2607:f0d0:1002:0051:0000:0000:0000:0004';
			jest.spyOn(geoip, 'lookup').mockImplementation(() => {
				throw new Error('Failed to lookup IP');
			});
			expect(() => service.getGeolocation(ip)).toThrow();
		});

		it('should handle error for an invalid IP', () => {
			const ip: string = 'tytytytytyty';
			expect(() => service.getGeolocation(ip)).toThrow();
		});

		it('should throw an error when IP is undefined', () => {
			const ip = undefined;
			expect(() => service.getGeolocation(ip)).toThrow();
		});

		it('should handle error if no geolocation data is found', () => {
			const ip: string = '2607:f0d0:1002:0051:0000:0000:0000:0004';
			jest.spyOn(geoip, 'lookup').mockReturnValue(null);
			expect(() => service.getGeolocation(ip)).toThrow();
		});

		it('should throw an error when createGeolocationData fails', () => {
			const ip: string = '2607:f0d0:1002:0051:0000:0000:0000:0004';
			const createDataErrorMock = jest.fn(() => {
				throw new Error('ошибка');
			});
			service['createGeolocationData'] = createDataErrorMock;
			expect(() => service.getGeolocation(ip)).toThrow();
		});
	});
});
