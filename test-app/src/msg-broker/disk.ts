import { createTopic } from "./topic";
import type { IDiskStorage, ITopic } from "./types";

function diskStorage(): IDiskStorage {
    const storage = new Map<string, ITopic>();
    return {
        createTopic(topic) {
            if (storage.has(topic)) {
                return;
            }
            storage.set(topic, createTopic());
        },
        createRecord(item) {
            const { topic, message } = item;
            if (!storage.has(topic)) {
                this.createTopic(topic);
            }
            const topicInstance = storage.get(topic);
            if (!topicInstance) {
                throw new Error(`Topic ${topic} not found`);
            }

            topicInstance.addMessage({
                message,
            });
        },
        addConsumer(callback: (message: any) => void, config: any) {
            const { topic } = config;
            if (!storage.has(topic)) {
                this.createTopic(topic);
            }
            const topicInstance = storage.get(topic);
            if (!topicInstance) {
                throw new Error(`Topic ${topic} not found`);
            }
            topicInstance.addConsumer(callback);
        }
    }
}
export { diskStorage };