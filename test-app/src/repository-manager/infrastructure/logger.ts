import type { IConfiguration } from "../workspace";

const createLogger = (
  config: Omit<IConfiguration, "dependencies" | "plugins">
) => {
  const { logging } = config;
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
      if (!logging) return;
      const groupTitle = `${type} ${scope ? `(${scope})` : ""}`;
      console.group(
        `%c${groupTitle}`,
        "color: #4CAF50; font-weight: bold; font-size: 14px;"
      );

      if (metadata) {
        const metadataValue = metadata();
        const { connections, repositories } = metadataValue;
        if (Array.isArray(connections) && connections.length > 0) {
          console.log(
            "%cConnections:",
            "color: #2196F3; font-weight: bold; font-size: 12px;"
          );
          console.table(connections);
        }
        if (Array.isArray(repositories) && repositories.length > 0) {
          console.log(
            "%cRepositories:",
            "color: #FF9800; font-weight: bold; font-size: 12px;"
          );
          console.table(repositories);
        }
      }

      console.groupEnd();
    },
  };
};

export { createLogger };
