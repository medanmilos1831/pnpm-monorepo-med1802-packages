import type { IDiskStorage } from "./types";

function createConsumer(storage: IDiskStorage) {
    return (callback: (message: any) => void, config: any) => {
        // console.log('OVO JE CONFIG', config);
        console.log('OVO JE STORAGE', storage);
        // callback('kita is a good girl');
    }
}

export { createConsumer };