import type { IProducerParams } from "./producer.types";

export interface IDiskStorage {
    createTopic(topic: string): void;
    createRecord(params: IProducerParams): void;
    addConsumer(callback: (message: any) => void, config: any): void;
}

