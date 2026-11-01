import { TemplateKey } from '../domain/template.constants.ts';

/** The steps of onboarding, in order. */
export const OnboardingStep = {
	pick: 'pick',
	units: 'units',
	goals: 'goals'
} as const;

/** One of the {@link OnboardingStep} values. */
export type OnboardingStep = (typeof OnboardingStep)[keyof typeof OnboardingStep];

/** What onboarding starts with picked: the two things most people want. */
export const DEFAULT_PICKS: readonly TemplateKey[] = [TemplateKey.workouts, TemplateKey.water];
