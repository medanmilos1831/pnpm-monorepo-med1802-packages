function createRepository<I extends Record<string, any>>(
  definition: (infrastructure: I) => unknown,
  infrastructure: I
) {
  let repository = undefined as unknown;
  let connections = 0;
  return {
    connect() {
      if (connections === 0) {
        repository = definition(infrastructure);
      }
      connections += 1;
    },
    disconnect() {
      if (connections === 0) return;
      connections -= 1;
      if (connections === 0) {
        repository = undefined;
      }
    },
    getRepository() {
      return repository;
    },
    // get repository() {
    //   return repository;
    // },
    getConnections() {
      return connections;
    },
  };
}

export { createRepository };
