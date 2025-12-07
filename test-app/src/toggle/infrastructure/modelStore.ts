const createModelStore = () => {
  let state: { open: boolean; message: any } = {
    open: false,
    message: undefined as any,
  };
  function setState(callback: (params: typeof state) => typeof state) {
    state = callback(state);
  }

  return {
    getStateByProp: (key: keyof typeof state) => () => state[key],
    setState,
  };
};

export { createModelStore };
