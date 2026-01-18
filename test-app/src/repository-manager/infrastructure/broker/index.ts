import type { IBroker } from "../../core";

function createBroker(): IBroker {
  let topics: any = {
    "user-repo": {
      messages: [],
      consumers: [],
    },
  };
  function syncTopics(item: any) {
    let topic = topics[item.topic];
    topic.consumers.forEach((consumer: any) => {
      while (consumer.offset < topic.messages.length) {
        const message = topic.messages[consumer.offset];
        consumer.callback(message);
        consumer.offset++;
      }
    });
  }
  return {
    publish(params) {
      topics[params.topic].messages.push({
        id: topics[params.topic].messages.length + 1,
        payload: params.payload,
        source: params.source,
      });
      syncTopics(params);
    },
    consumer(params: any) {
      topics[params.topic].consumers.push({
        callback: params.callback,
        offset: topics[params.topic].messages.length,
      });
    },
  };
}

export { createBroker };
