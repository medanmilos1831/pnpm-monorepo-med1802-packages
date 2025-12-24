import { createContainerInstance, createStore } from "./core";
import type { IContainerInstance, IManagerConfig } from "./types";

/**
 * Creates a repository manager instance with multiple containers.
 * Each container can have its own dependencies and repositories.
 *
 * @template D - The type of dependencies/infrastructure
 * @param config - Array of container configurations. Each container must have:
 *   - `id`: Unique identifier for the container
 *   - `dependencies`: Infrastructure dependencies to inject into repositories
 *   - `repositories`: Object mapping repository IDs to factory functions
 *   - `logging`: Optional flag to enable/disable logging (default: false)
 * @returns Manager object with `query` method to access repositories
 *
 * @example
 * ```typescript
 * const manager = createRepositoryManager([
 *   {
 *     id: "app-container",
 *     dependencies: {
 *       httpClient: {
 *         get: (url) => fetch(url).then(r => r.json())
 *       }
 *     },
 *     repositories: {
 *       userRepo: (deps) => ({
 *         getUsers: () => deps.httpClient.get("/api/users")
 *       })
 *     },
 *     logging: true
 *   }
 * ]);
 * ```
 */
function createRepositoryManager<D>(config: IManagerConfig<D>[]) {
  const store = createStore<IContainerInstance<unknown>>();
  config.forEach((containerConfig) => {
    store.setState(
      containerConfig.id,
      createContainerInstance(containerConfig)
    );
  });

  return {
    /**
     * Queries a repository from a container using a path format: "containerId/repositoryId".
     * Automatically manages connection lifecycle with reference counting.
     *
     * @template R - The return type of the repository
     * @param path - Path to repository in format "containerId/repositoryId"
     * @returns Object containing:
     *   - `repository`: The repository instance
     *   - `disconnect`: Function to disconnect and cleanup (decrements reference count)
     * @throws {Error} If container or repository is not found
     *
     * @example
     * ```typescript
     * const { repository, disconnect } = manager.query<IUserRepo>("app-container/userRepo");
     *
     * // Use repository
     * await repository.getUsers();
     *
     * // Cleanup when done
     * disconnect();
     * ```
     */
    query<R>(path: string) {
      const [containerId, id] = path.split("/");
      const container = store.getState(containerId) as IContainerInstance<R>;
      if (!container) {
        throw new Error(`Container "${containerId}" not found`);
      }
      return container.queryRepository(id);
    },
  };
}

export { createRepositoryManager };
