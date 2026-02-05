import type { IDiskStorage } from "./types";

function createProducer(storage: IDiskStorage) {
    return (params: Parameters<IDiskStorage['createRecord']>[0]) => {
        storage.createRecord(params);
    }
}

export { createProducer };