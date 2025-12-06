import type { createMessageBroker } from "@med1802/scoped-observer-message-broker";
import { EventName, type IEvent, type onChangePayload } from "../types";

const createModelState = (
  messageBroker: ReturnType<typeof createMessageBroker>
) => {
  let state = false;
  let message = undefined as any;
  const subscribe = messageBroker.subscribe;

  subscribe({
    eventName: EventName.ON_CHANGE,
    callback: (event: IEvent<onChangePayload>) => {
      message = event.payload.message;
      state = event.payload.open;
    },
  });

  subscribe({
    eventName: EventName.ON_SET_MESSAGE,
    callback: (event: IEvent<onChangePayload>) => {
      message = event.payload.message;
    },
  });

  return {
    getMessage: () => message,
    getState: () => state,
  };
};

export { createModelState };
