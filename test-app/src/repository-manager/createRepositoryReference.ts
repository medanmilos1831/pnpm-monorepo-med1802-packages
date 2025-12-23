function createRepositoryReference<I extends Record<string, any>>(
  definition: (infrastructure: I) => unknown,
  infrastructure: I
) {
  let item = undefined as unknown;
  let connections = 0;
  return {
    connect() {
      if (connections === 0) {
        item = definition(infrastructure);
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
