import { type IEvent, type onChangePayload } from "../../types";

const createModelLogger = (active: boolean, id: string) => {
  return {
    logAction: <T extends (...args: any[]) => void>(
      callback: T,
      params: onChangePayload
    ): T => {
      return ((...args: any[]) => {
        const { open, message } = params;
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
        callback(...args);
      }) as T;
    },
  };
};

export { createModelLogger };
