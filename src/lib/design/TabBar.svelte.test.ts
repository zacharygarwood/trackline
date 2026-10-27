import { render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import TabBar from './TabBar.svelte';

const tabs = [
	{ href: '/app', label: 'Today', icon: 'today' },
	{ href: '/app/train', label: 'Train', icon: 'train' }
] as const;

describe('TabBar', () => {
	it('links to every tab', () => {
		render(TabBar, { props: { tabs, currentHref: '/app', label: 'Sections' } });

		expect(screen.getByRole('link', { name: 'Train' })).toHaveAttribute('href', '/app/train');
	});

	it('marks only the current tab', () => {
		render(TabBar, { props: { tabs, currentHref: '/app/train', label: 'Sections' } });

		expect(screen.getByRole('link', { name: 'Train' })).toHaveAttribute('aria-current', 'page');
		expect(screen.getByRole('link', { name: 'Today' })).not.toHaveAttribute('aria-current');
	});
});
