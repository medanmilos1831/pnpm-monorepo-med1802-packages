function createRepositoryReference(id: string, create: () => any) {
  let item = undefined as any;
  let connections = 0;
  return {
    connect() {
      if (connections === 0) {
        item = create();
      }
      connections += 1;
      console.log("CONNECTED REPOSITORY", id, connections);
    },
    disconnect() {
      if (connections === 0) return;
      connections -= 1;
      if (connections === 0) {
        item = undefined;
      }
      console.log("CONNECTED REPOSITORY", id, connections);
    },
    getItem() {
      return item;
    },
  };
}

export { createRepositoryReference };
