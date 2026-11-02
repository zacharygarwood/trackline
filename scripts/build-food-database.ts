import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

/**
 * Builds the app's built-in food database from the USDA FoodData Central
 * "SR Legacy" CSV download (public domain), so food search works with no
 * network. Run it after downloading and unzipping the dataset:
 *
 *   pnpm foods <unzipped folder> static/foods/usda-sr-legacy.json
 *
 * Each food keeps its name, its numbers per 100 g in the order of
 * {@link NUTRIENTS}, and up to {@link MAX_PORTIONS} household portions with
 * their weight in grams.
 */

/** The nutrients kept, by the app's field key and the USDA nutrient id. */
export const NUTRIENTS = [
	['calories', '1008'],
	['protein', '1003'],
	['carbs', '1005'],
	['fat', '1004'],
	['fiber', '1079'],
	['sugar', '2000'],
	['sodium', '1093']
] as const;

const MAX_PORTIONS = 4;
const UNDETERMINED_UNIT = '9999';
const TENTHS = 10;
const SOURCE = 'USDA FoodData Central, SR Legacy (April 2018). Public domain (CC0 1.0).';

/**
 * Splits one CSV line whose fields are all quoted, such as `"1","Oats, raw"`.
 *
 * @param line - The line.
 * @returns Its fields, unquoted.
 */
export function csvFields(line: string): string[] {
	const fields: string[] = [];
	let field = '';
	let quoted = false;
	for (let index = 0; index < line.length; index += 1) {
		const char = line.charAt(index);
		if (quoted && char === '"' && line.charAt(index + 1) === '"') {
			field += '"';
			index += 1;
		} else if (char === '"') quoted = !quoted;
		else if (char === ',' && !quoted) {
			fields.push(field);
			field = '';
		} else field += char;
	}
	fields.push(field);
	return fields;
}

type CsvRow = Readonly<Record<string, string>>;

function rows(folder: string, file: string): CsvRow[] {
	const [header = '', ...lines] = readFileSync(path.join(folder, file), 'utf8').split('\n');
	const columns = csvFields(header);
	return lines
		.filter((line) => line.trim() !== '')
		.map((line) => {
			const fields = csvFields(line);
			return Object.fromEntries(columns.map((column, index) => [column, fields.at(index) ?? '']));
		});
}

const text = (row: CsvRow, column: string) => row[column] ?? '';

function rounded(amount: number): number {
	return Math.round(amount * TENTHS) / TENTHS;
}

/**
 * A portion's label, such as "1 cup, chopped" or "1 medium".
 *
 * @param amount - How many units.
 * @param unit - The unit's name, or undefined when the modifier says it all.
 * @param modifier - The USDA modifier, such as "chopped".
 */
export function portionLabel(amount: string, unit: string | undefined, modifier: string): string {
	const count = String(Number(amount));
	if (unit === undefined) return `${count} ${modifier}`.trim();
	return modifier === '' ? `${count} ${unit}` : `${count} ${unit}, ${modifier}`;
}

type Numbers = (number | null)[];
type PortionPair = [label: string, grams: number];

function nutrientValues(folder: string): Map<string, Numbers> {
	const wanted = new Map<string, number>(NUTRIENTS.map(([, id], index) => [id, index]));
	const values = new Map<string, Numbers>();
	for (const row of rows(folder, 'food_nutrient.csv')) {
		const [fdcId, index] = [text(row, 'fdc_id'), wanted.get(text(row, 'nutrient_id'))];
		if (index === undefined) continue;
		const list = values.get(fdcId) ?? NUTRIENTS.map(() => null);
		list.splice(index, 1, rounded(Number(text(row, 'amount'))));
		values.set(fdcId, list);
	}
	return values;
}

function portionsByFood(folder: string): Map<string, PortionPair[]> {
	const units = new Map(
		rows(folder, 'measure_unit.csv').map((row) => [text(row, 'id'), text(row, 'name')])
	);
	const portions = new Map<string, PortionPair[]>();
	for (const row of rows(folder, 'food_portion.csv')) {
		const [fdcId, unitId, grams] = [
			text(row, 'fdc_id'),
			text(row, 'measure_unit_id'),
			Number(text(row, 'gram_weight'))
		];
		const list = portions.get(fdcId) ?? [];
		const unit = unitId === UNDETERMINED_UNIT ? undefined : units.get(unitId);
		const label = portionLabel(text(row, 'amount'), unit, text(row, 'modifier'));
		if (list.length < MAX_PORTIONS && grams > 0) list.push([label, rounded(grams)]);
		portions.set(fdcId, list);
	}
	return portions;
}

interface BuiltFood {
	readonly id: string;
	readonly name: string;
	readonly numbers: Numbers;
	readonly portions: PortionPair[];
}

function build(folder: string): string {
	const [values, portions] = [nutrientValues(folder), portionsByFood(folder)];
	const foods = rows(folder, 'food.csv')
		.flatMap((row): BuiltFood[] => {
			const [id, name] = [text(row, 'fdc_id'), text(row, 'description')];
			const numbers = values.get(id);
			const calories = numbers?.at(0);
			return numbers === undefined || calories === undefined || calories === null
				? []
				: [{ id, name, numbers, portions: portions.get(id) ?? [] }];
		})
		.sort((one, other) => one.name.localeCompare(other.name))
		.map(({ id, name, numbers, portions: list }) => [id, name, numbers, list]);
	return JSON.stringify({ source: SOURCE, nutrients: NUTRIENTS.map(([key]) => key), foods });
}

const ARGUMENTS_FROM = 2;
const [folder, output] = process.argv.slice(ARGUMENTS_FROM);
if (import.meta.main && folder !== undefined && output !== undefined)
	writeFileSync(output, build(folder));
