import { MassUnit } from '../../shared/mass-unit.constants.ts';

/** How much the weight stepper changes per tap: the smallest common plate pair in each unit. */
export const WEIGHT_STEP = { [MassUnit.kg]: 2.5, [MassUnit.lb]: 5 } as const;

/** The heaviest weight a set can be entered with, in either unit. */
export const MAX_SET_WEIGHT = 2000;
