import { describe, expect, it } from 'vitest';
import type {
	WeighInReader,
	WeighInWriter
} from '../../src/lib/body/domain/weigh-in-repository.ts';
import { LocalDate } from '../../src/lib/shared/local-date.ts';
import { aWeighIn } from '../builders/weigh-in.builder.ts';
import { expectOk } from '../support/result.ts';

type WeighInRepository = WeighInReader & WeighInWriter;

/**
 * The behavior every weigh-in repository must have, run against both the
 * in-memory fake and the SQLite implementation so the fake stays honest.
 */
export function describeWeighInRepository(create: () => Promise<WeighInRepository>): void {
	describe('weigh-in repository contract', () => {
		it('finds a saved weigh-in by its date', async () => {
			const repository = await create();
			const weighIn = aWeighIn().on('2026-10-27').weighing(80.4).build();
			await repository.save(weighIn);

			const found = await repository.findByDate(expectOk(LocalDate.parse('2026-10-27')));

			expect(found?.id).toBe(weighIn.id);
			expect(found?.weight.kilograms).toBe(80.4);
			expect(found?.date.toString()).toBe('2026-10-27');
		});

		it('finds nothing on a date without a weigh-in', async () => {
			const repository = await create();

			expect(await repository.findByDate(expectOk(LocalDate.parse('2026-10-27')))).toBeUndefined();
		});

		it('lists weigh-ins newest first', async () => {
			const repository = await create();
			await repository.save(aWeighIn().on('2026-10-01').build());
			await repository.save(aWeighIn().on('2026-10-03').build());
			await repository.save(aWeighIn().on('2026-10-02').build());

			const dates = (await repository.findAll()).map((weighIn) => weighIn.date.toString());

			expect(dates).toEqual(['2026-10-03', '2026-10-02', '2026-10-01']);
		});

		it('replaces a weigh-in saved again with the same id', async () => {
			const repository = await create();
			const original = aWeighIn().on('2026-10-27').weighing(80).build();
			await repository.save(original);

			await repository.save({ ...original, weight: aWeighIn().weighing(79.5).build().weight });

			const all = await repository.findAll();
			expect(all.map((weighIn) => weighIn.weight.kilograms)).toEqual([79.5]);
		});

		it('refuses a second weigh-in with a different id on the same date', async () => {
			const repository = await create();
			await repository.save(aWeighIn().on('2026-10-27').build());

			await expect(repository.save(aWeighIn().on('2026-10-27').build())).rejects.toThrow();
		});

		it('deletes a weigh-in', async () => {
			const repository = await create();
			const weighIn = aWeighIn().build();
			await repository.save(weighIn);

			await repository.delete(weighIn.id);

			expect(await repository.findAll()).toEqual([]);
		});
	});
}
