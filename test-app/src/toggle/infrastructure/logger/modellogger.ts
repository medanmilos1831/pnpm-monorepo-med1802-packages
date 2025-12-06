import { EventName, type IEvent, type onChangePayload } from "../../types";
import type { createMessageBroker } from "@med1802/scoped-observer-message-broker";

const createModelLogger = (
  active: boolean,
  messageBroker: ReturnType<typeof createMessageBroker>
) => {
  const subscribe = messageBroker.subscribe;
  subscribe({
    eventName: EventName.ON_LOG_ACTION,
    callback: (event: IEvent<onChangePayload & { id: string }>) => {
      const { id, open, message } = event.payload;
      if (active) {
        console.table([
          {
            id,
            open,
          },
        ]);
        if (message !== undefined) {
          console.group(
            `%c📨 Message`,
            "color: #4CAF50; font-weight: bold; font-size: 12px;"
          );
          if (typeof message === "object" && message !== null) {
            console.log(
              "%cObject:",
              "color: #2196F3; font-weight: bold",
              message
            );
          } else {
            console.log(
              "%cValue:",
              "color: #2196F3; font-weight: bold",
              message
            );
          }
          console.groupEnd();
        }
      }
      // console.log(event);
    },
  });
  return {
    logAction: <T extends (...args: any[]) => Omit<IEvent, "scope">>(
      callback: T
    ): T => {
      return ((...args: any[]) => {
        // const { payload } = callback(...args);
        // const { open, message } = payload;
        // if (active) {
        //   console.table([
        //     {
        //       id,
        //       open,
        //     },
        //   ]);
        //   if (message !== undefined) {
        //     console.group(
        //       `%c📨 Message`,
        //       "color: #4CAF50; font-weight: bold; font-size: 12px;"
        //     );
        //     if (typeof message === "object" && message !== null) {
        //       console.log(
        //         "%cObject:",
        //         "color: #2196F3; font-weight: bold",
        //         message
        //       );
        //     } else {
        //       console.log(
        //         "%cValue:",
        //         "color: #2196F3; font-weight: bold",
        //         message
        //       );
        //     }
        //     console.groupEnd();
        //   }
        // }
      }) as T;
    },
  };
};

export { createModelLogger };
