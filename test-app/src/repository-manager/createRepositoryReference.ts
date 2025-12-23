function createRepositoryReference<C extends Record<string, any>>(
  definition: (config: C) => unknown,
  config: C
) {
  let item = undefined as unknown;
  let connections = 0;
  return {
    connect() {
      if (connections === 0) {
        item = definition(config);
      }
      connections += 1;
    },
    disconnect() {
      if (connections === 0) return;
      connections -= 1;
      if (connections === 0) {
        item = undefined;
      }
    },
    getItem() {
      return item;
    },
    getConnections() {
      return connections;
    },
  };
}

export { createRepositoryReference };
