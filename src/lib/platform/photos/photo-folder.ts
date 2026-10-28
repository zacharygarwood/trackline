/** A named file in the photo folder. */
export interface PhotoFile {
	readonly name: string;
	readonly bytes: Uint8Array;
}

/** The on-device folder of photo files. */
export interface PhotoFolder {
	/** Writes files, replacing any with the same names. */
	write(files: readonly PhotoFile[]): Promise<void>;
	/** A file's bytes, or undefined if there is no such file. */
	read(name: string): Promise<Uint8Array | undefined>;
	/** Removes files; names that don't exist are ignored. */
	remove(names: readonly string[]): Promise<void>;
	/** Every file in the folder. */
	readAll(): Promise<readonly PhotoFile[]>;
	/** Removes every file. */
	clear(): Promise<void>;
}
