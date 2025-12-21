function createRepository(id: string, create: () => any) {
  let item = undefined as any;
  let connections = 0;
  return {
    connect() {
      if (connections === 0) {
        item = create();
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
  };
}

export { createRepository };
