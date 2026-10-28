import { describe, expect, it } from 'vitest';
import { aWeighIn } from '../../../../tests/builders/weigh-in.builder.ts';
import { movingAverage } from './weight-trend.ts';

describe('movingAverage', () => {
	it('is empty without weigh-ins', () => {
		expect(movingAverage([])).toEqual([]);
	});

	it('averages each day with the weigh-ins of the six days before it, oldest first', () => {
		const trend = movingAverage([
			aWeighIn().on('2026-10-03').weighing(79).build(),
			aWeighIn().on('2026-10-01').weighing(81).build(),
			aWeighIn().on('2026-10-02').weighing(80).build()
		]);

		expect(trend.map((point) => [point.date.toString(), point.weight.kilograms])).toEqual([
			['2026-10-01', 81],
			['2026-10-02', 80.5],
			['2026-10-03', 80]
		]);
	});

	it('drops weigh-ins older than seven days from the average', () => {
		const trend = movingAverage([
			aWeighIn().on('2026-10-01').weighing(90).build(),
			aWeighIn().on('2026-10-08').weighing(80).build()
		]);

		expect(trend.at(-1)?.weight.kilograms).toBe(80);
	});

	it('includes a weigh-in exactly six days earlier', () => {
		const trend = movingAverage([
			aWeighIn().on('2026-10-01').weighing(90).build(),
			aWeighIn().on('2026-10-07').weighing(80).build()
		]);

		expect(trend.at(-1)?.weight.kilograms).toBe(85);
	});
});
