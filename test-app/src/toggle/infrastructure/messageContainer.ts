import type { createMessageBroker } from "@med1802/scoped-observer-message-broker";
import { EventName, type IEvent, type onChangePayload } from "../types";

const createMessageContainer = (
  messageBroker: ReturnType<typeof createMessageBroker>
) => {
  let message = undefined as any;
  const subscribe = messageBroker.subscribe;
  subscribe({
    eventName: EventName.ON_SET_MESSAGE,
    callback: (event: IEvent<onChangePayload>) => {
      message = event.payload.message;
    },
  });
  return {
    getMessage: () => message,
  };
};

export { createMessageContainer };
