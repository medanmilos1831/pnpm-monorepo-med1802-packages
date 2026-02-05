import type { IProducerParams } from "./producer.types";


export interface ITopic {
    addMessage(message: IProducerParams['message']): void;
    addConsumer(callback: (message: any) => void): void;
}