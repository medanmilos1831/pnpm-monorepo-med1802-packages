export type middlewareParamsType = { use: string; value: any };

export type middlewareType = (
  middleware: {
    resolve: (callback: (value: any, message: any) => any) => void;
    reject: () => void;
  },
  state: any
) => void;
export type middlewareStoreConfigType = {
  [key: string]: middlewareType;
};
