import { createConsumer } from "./consumer";
import { diskStorage } from "./disk";
import { createProducer } from "./producer";

const createMessageBroker = () => {
    const storage = diskStorage();
    const producer = createProducer(storage);
    const consumer = createConsumer(storage);

    setTimeout(() => {
        console.log(storage.getRecords());
    }, 1000);
    return {
        producer,
        consumer,
    }
};

export { createMessageBroker };