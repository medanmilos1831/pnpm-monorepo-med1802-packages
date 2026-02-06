import type { IDiskStorage } from "./types";


function diskStorage(): IDiskStorage {
    const storage = new Map<string, any>();
    return {
        createRecord(record) {
            const { topic, ...rest } = record;
            if (!storage.has(topic)) {
                storage.set(topic, []);
            }
            const item = storage.get(topic);
            item.push(rest);
        },
        getRecords() {
            return storage.entries() as any;
        }
    }
}
export { diskStorage };
