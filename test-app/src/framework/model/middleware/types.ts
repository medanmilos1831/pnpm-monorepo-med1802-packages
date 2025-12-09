export type middlewareParamsType = { use: string; value: any };

export type middlewareType<S = any> = (
  middleware: {
    resolve: (callback: (value: any, message: any) => any) => void;
    reject: () => void;
  },
  state: S
) => void;
export type middlewareStoreConfigType<S = any> = {
  [key: string]: middlewareType<S>;
};
