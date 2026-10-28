import { describe, expect, it } from 'vitest';
import { describeWeighInRepository } from '../../../../tests/contracts/weigh-in-repository.contract.ts';
import { describeWeightGoalRepository } from '../../../../tests/contracts/weight-goal-repository.contract.ts';
import { migratedDatabase } from '../../../../tests/support/migrated-database.ts';
import { SqliteWeighInRepository } from './sqlite-weigh-in-repository.ts';
import { SqliteWeightGoalRepository } from './sqlite-weight-goal-repository.ts';

describeWeighInRepository(async () => new SqliteWeighInRepository(await migratedDatabase()));
describeWeightGoalRepository(async () => new SqliteWeightGoalRepository(await migratedDatabase()));

describe('SqliteWeighInRepository with corrupt data', () => {
	it('fails loudly instead of returning an invalid weigh-in', async () => {
		const database = await migratedDatabase();
		await database.execute({
			name: 'insert corrupt row',
			sql: "INSERT INTO weigh_in (id, date, weight_kg) VALUES ('not-an-id', '2026-10-27', 80)",
			params: []
		});

		await expect(new SqliteWeighInRepository(database).findAll()).rejects.toThrow(
			'Corrupt weigh_in row'
		);
	});
});
