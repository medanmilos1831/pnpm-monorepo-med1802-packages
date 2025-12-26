function createRepositoryAccessor<I extends Record<string, any>>(
  definition: (infrastructure: I) => unknown,
  infrastructure: I
) {
  let repository = undefined as unknown;
  let connections = 0;
  return {
    get repository() {
      return repository;
    },
    get connections() {
      return connections;
    },
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
  };
}

export { createRepositoryAccessor };
