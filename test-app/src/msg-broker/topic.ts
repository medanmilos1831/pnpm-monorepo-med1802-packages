import type { IProducerParams, ITopic } from "./types";

function createTopic(): ITopic {
    const messages = []
    return {
        addMessage(params: IProducerParams['message']) {
            messages.push(params);
        },
        addConsumer() {
            console.log('OVO JE ADD CONSUMER');
        }
    };
}

export { createTopic };