/** The kinds of request the main thread sends to the database worker. */
export const SqlRequestKind = {
	query: 'query',
	execute: 'execute',
	transaction: 'transaction',
	exportFile: 'exportFile',
	replaceFile: 'replaceFile',
	wipe: 'wipe'
} as const;
