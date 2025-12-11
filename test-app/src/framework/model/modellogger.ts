const createModelLogger = (active: boolean, id: string) => {
  return {
    logAction: <T extends (...args: any[]) => void>(
      callback: T,
      params: any
    ): T => {
      return ((...args: any[]) => {
        if (active) {
          const timestamp = new Date().toISOString();
          console.group(`🔔 [${id}] Action Log - ${timestamp}`);
          console.log("📦 Payload:", params);
          console.groupEnd();
        }
        callback(...args);
      }) as T;
    },
  };
};

export { createModelLogger };
