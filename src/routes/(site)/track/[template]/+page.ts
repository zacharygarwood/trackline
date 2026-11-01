import { error } from '@sveltejs/kit';
import { TemplatePage } from '../../../site-route.constants.ts';

const NOT_FOUND = 404;

function isTemplatePage(value: string): value is TemplatePage {
	return Object.values(TemplatePage).some((page) => page === value);
}

/** Prerenders one page per template on the site. */
export const entries = (): { template: TemplatePage }[] =>
	Object.values(TemplatePage).map((template) => ({ template }));

/** Reads which template the page is about from its address. */
export const load = ({ params }: { params: { template: string } }): { template: TemplatePage } => {
	if (!isTemplatePage(params.template)) error(NOT_FOUND);
	return { template: params.template };
};
