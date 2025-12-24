/**
 * Creates a repository instance with lifecycle management using reference counting.
 * The repository is lazily initialized on first connection and destroyed when all
 * connections are disconnected.
 *
 * @template I - The type of dependencies/infrastructure
 * @param repository - Factory function that creates the repository instance
 * @param dependencies - Infrastructure dependencies to inject into the repository factory
 * @returns Repository instance manager with connection lifecycle methods:
 *   - `connect()`: Connects to repository (creates instance on first call)
 *   - `disconnect()`: Disconnects from repository (destroys instance when no connections remain)
 *   - `getReference()`: Gets the current repository instance
 *   - `getConnections()`: Gets the current number of active connections
 *
 * @example
 * ```typescript
 * const instance = createRepositoryInstance(
 *   (deps) => ({
 *     getUsers: () => deps.httpClient.get("/users")
 *   }),
 *   { httpClient: {...} }
 * );
 *
 * instance.connect(); // Creates repository (connections: 1)
 * instance.connect(); // Reuses repository (connections: 2)
 * const repo = instance.getReference();
 * await repo.getUsers();
 * instance.disconnect(); // Still active (connections: 1)
 * instance.disconnect(); // Repository destroyed (connections: 0)
 * ```
 */
function createRepositoryInstance<I = unknown>(
  repository: (dependencies: I) => unknown,
  dependencies: I
) {
  let reference = undefined as unknown;
  let connections = 0;
  return {
    /**
     * Connects to the repository instance. Creates the instance on first call
     * and increments the connection counter. Subsequent calls reuse the same instance.
     */
    connect() {
      if (connections === 0) {
        reference = repository(dependencies);
      }
      connections += 1;
    },
    /**
     * Disconnects from the repository instance. Decrements the connection counter.
     * When the counter reaches zero, the repository instance is destroyed.
     */
    disconnect() {
      if (connections === 0) return;
      connections -= 1;
      if (connections === 0) {
        reference = undefined;
      }
    },
    /**
     * Gets the current repository instance reference.
     * Returns `undefined` if the repository hasn't been connected yet.
     *
     * @returns The repository instance or `undefined` if not connected
     */
    getReference() {
      return reference;
    },
    /**
     * Gets the current number of active connections to this repository instance.
     *
     * @returns Number of active connections (0 if not connected)
     */
    getConnections() {
      return connections;
    },
  };
}

export { createRepositoryInstance };
