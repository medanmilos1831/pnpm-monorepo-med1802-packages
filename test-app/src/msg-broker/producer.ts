import type { IDiskStorage } from "./types";

function createProducer(storage: IDiskStorage) {
    return (params: any) => {
        storage.createRecord(params);
    }
}

export { createProducer };