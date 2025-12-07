const createModelStore = () => {
  let state = {
    open: false,
    message: undefined as any,
  };
  function setState(callback: (params: typeof state) => typeof state) {
    state = callback(state);
  }

  return {
    getState: (key: keyof typeof state) => () => state[key],
    setState,
  };
};

export { createModelStore };
