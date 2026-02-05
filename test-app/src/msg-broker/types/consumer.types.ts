export interface IConsumerParams {
    topic: string;
    callback: (message: any) => void;
}

