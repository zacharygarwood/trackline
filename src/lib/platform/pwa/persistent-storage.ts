/** The part of `navigator.storage` used to ask for durable storage. */
export type PersistableStorage = Pick<StorageManager, 'persisted' | 'persist'>;

/**
 * Asks the browser not to evict the app's data under storage pressure.
 *
 * Browsers may grant or refuse silently; the app works either way, and
 * exports remain the real backup.
 *
 * @param storage - The storage manager, if the browser has one.
 * @returns Whether the data is now stored persistently.
 */
export async function requestPersistentStorage(
	storage: PersistableStorage | undefined
): Promise<boolean> {
	if (storage === undefined) return false;
	return (await storage.persisted()) || storage.persist();
}
