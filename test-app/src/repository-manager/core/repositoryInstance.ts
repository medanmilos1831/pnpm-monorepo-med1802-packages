function createRepositoryInstance<I = unknown>(
  repository: (dependencies: I) => unknown,
  dependencies: I
) {
  let reference = undefined as unknown;
  let connections = 0;
  return {
    connect() {
      if (connections === 0) {
        reference = repository(dependencies);
      }
      connections += 1;
    },
    disconnect() {
      if (connections === 0) return;
      connections -= 1;
      if (connections === 0) {
        reference = undefined;
      }
    },
    getReference() {
      return reference;
    },
    getConnections() {
      return connections;
    },
  };
}

export { createRepositoryInstance };
