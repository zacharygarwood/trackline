import { TemplateGroup } from '../domain/template.constants.ts';
import { BASICS } from '../domain/basics.ts';
import type { BasicTemplate, Template } from '../domain/template.ts';
import { TEMPLATES } from '../domain/templates.ts';

/** One plain group of templates, such as Move or Mind. */
export interface TemplateSection {
	readonly group: TemplateGroup;
	readonly templates: readonly Template[];
}

/**
 * Every ready-made template, in its group, groups in a fixed order. The basic
 * templates are left out, because each needs a name before it is added.
 */
export const TEMPLATE_SECTIONS: readonly TemplateSection[] = Object.values(TemplateGroup)
	.filter((group) => group !== TemplateGroup.basic)
	.map((group) => ({
		group,
		templates: TEMPLATES.filter((template) => template.group === group)
	}));

/**
 * The basic template with a key, such as one passed in page state.
 *
 * @param key - The template's key, if any.
 */
export function basicOf(key: string | undefined): BasicTemplate | undefined {
	return BASICS.find((template) => template.key === key);
}
