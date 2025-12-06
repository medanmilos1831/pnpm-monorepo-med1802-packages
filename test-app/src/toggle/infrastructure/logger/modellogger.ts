import type { IEvent } from "../../types";

const createModelLogger = (id: string, active: boolean) => {
  return {
    logAction: <T extends (...args: any[]) => Omit<IEvent, "scope">>(
      callback: T
    ): T => {
      return ((...args: any[]) => {
        const { payload } = callback(...args);
        const { open, message } = payload;
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
      }) as T;
    },
  };
  //   logAction: <
  //     T extends (...args: any[]) => {
  //       payload: onChangePayload;
  //       eventName: string;
  //     }
  //   >(
  //     callback: T
  //   ): T => {
  //     return ((...args: Parameters<T>) => {
  //       const result = callback(...args);
  //       const { message, open } = result.payload;
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
  //     }) as T;
  //   },
  // };
};

export { createModelLogger };
