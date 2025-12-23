const createLogger = () => {
  return {
    log: (
      callback: () => void,
      {
        type,
        scope,
        metadata,
      }: { type: string; scope: string; metadata: () => any }
    ) => {
      callback();
      console.group(`${type} ${scope ? `(${scope})` : ""}`);

      if (metadata) {
        const metadataValue = metadata();
        const { connections, repositories } = metadataValue;
        if (Array.isArray(connections) && connections.length > 0) {
          console.table(connections);
        }
        if (Array.isArray(repositories) && repositories.length > 0) {
          console.table(repositories);
        }
      }

      console.groupEnd();
    },
  };
};

export { createLogger };
