import type { middlewareType } from "./types";

const createMiddlewareContext = (value: any, payload: any) => {
  let state = {
    payload,
    status: true,
  };
  return (middleware: middlewareType) => {
    middleware(
      {
        resolve: (params) => {
          let result = params(value, payload);
          state.payload = result;
        },
        reject: () => {
          state.status = false;
        },
      },
      payload.open
    );
    return state;
  };
};

export { createMiddlewareContext };
