import { beforeEach, describe, expect, it } from 'vitest';
import { aWeighIn } from '../../../../tests/builders/weigh-in.builder.ts';
import { InMemoryWeighInRepository } from '../../../../tests/fakes/in-memory-weigh-in-repository.ts';
import { SequentialIdGenerator } from '../../../../tests/fakes/sequential-id-generator.ts';
import { expectErr, expectOk } from '../../../../tests/support/result.ts';
import { LocalDate } from '../../shared/local-date.ts';
import { Mass } from '../../shared/mass.ts';
import { WeightOutOfRange } from '../domain/weigh-in.ts';
import { DeleteWeighIn } from './delete-weigh-in.ts';
import { ListWeighIns } from './list-weigh-ins.ts';
import { RecordWeighIn } from './record-weigh-in.ts';

const date = (text: string) => expectOk(LocalDate.parse(text));
const kg = (amount: number) => expectOk(Mass.fromKg(amount));

describe('weigh-in use cases', () => {
	let repository: InMemoryWeighInRepository;
	let record: RecordWeighIn;

	beforeEach(() => {
		repository = new InMemoryWeighInRepository();
		record = new RecordWeighIn(repository, new SequentialIdGenerator());
	});

	it('records a weigh-in', async () => {
		const weighIn = expectOk(await record.execute({ date: date('2026-10-27'), weight: kg(80.4) }));

		expect(await new ListWeighIns(repository).execute()).toEqual([weighIn]);
	});

	it('replaces the weigh-in of the same day, keeping its id', async () => {
		const first = expectOk(await record.execute({ date: date('2026-10-27'), weight: kg(80.4) }));

		const second = expectOk(await record.execute({ date: date('2026-10-27'), weight: kg(80.1) }));

		expect(second.id).toBe(first.id);
		expect((await repository.findAll()).map((weighIn) => weighIn.weight.kilograms)).toEqual([80.1]);
	});

	it('rejects an implausible weight and stores nothing', async () => {
		const error = expectErr(await record.execute({ date: date('2026-10-27'), weight: kg(8) }));

		expect(error).toBeInstanceOf(WeightOutOfRange);
		expect(await repository.findAll()).toEqual([]);
	});

	it('lists weigh-ins newest first', async () => {
		await record.execute({ date: date('2026-10-01'), weight: kg(81) });
		await record.execute({ date: date('2026-10-02'), weight: kg(80) });

		const dates = (await new ListWeighIns(repository).execute()).map((weighIn) =>
			weighIn.date.toString()
		);

		expect(dates).toEqual(['2026-10-02', '2026-10-01']);
	});

	it('deletes a weigh-in', async () => {
		const weighIn = aWeighIn().build();
		await repository.save(weighIn);

		await new DeleteWeighIn(repository).execute({ id: weighIn.id });

		expect(await repository.findAll()).toEqual([]);
	});
});
