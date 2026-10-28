import { createContext } from 'svelte';
import type { App } from './container.ts';

/**
 * Shares the starting app with every screen. Screens await it, so no query
 * runs before the database is open and migrated.
 */
export const [getAppContext, setAppContext] = createContext<Promise<App>>();
