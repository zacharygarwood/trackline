/** Names of the files inside a backup zip. */
export const BackupEntry = {
	manifest: 'manifest.json',
	database: 'trackline.sqlite3',
	/** The folder holding photo files, each under its photo store name. */
	photoFolder: 'photos/'
} as const;
