import { describeWeighInRepository } from '../contracts/weigh-in-repository.contract.ts';
import { describeWeightGoalRepository } from '../contracts/weight-goal-repository.contract.ts';
import { InMemoryWeighInRepository } from './in-memory-weigh-in-repository.ts';
import { InMemoryWeightGoalRepository } from './in-memory-weight-goal-repository.ts';

describeWeighInRepository(() => Promise.resolve(new InMemoryWeighInRepository()));
describeWeightGoalRepository(() => Promise.resolve(new InMemoryWeightGoalRepository()));
