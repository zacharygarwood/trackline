/** A file to hand to the browser's download flow. */
export interface DownloadableFile {
	readonly name: string;
	readonly bytes: Uint8Array;
}

/**
 * Hands a file to the browser as a download. The file never leaves the
 * device unless the user moves it themselves.
 *
 * @param file - The file name and contents.
 */
export function downloadFile(file: DownloadableFile): void {
	const url = URL.createObjectURL(new Blob([new Uint8Array(file.bytes)]));
	const link = document.createElement('a');
	link.href = url;
	link.download = file.name;
	link.click();
	URL.revokeObjectURL(url);
}
