import { createLogger } from "../logger";
import { createRepositoryInstance } from "./repositoryInstance";
import { createStore } from "./store";
import type { IManagerConfig, IRepositoryInstance } from "../types";

/**
 * Creates a container instance that manages multiple repositories with shared dependencies.
 * The container initializes all repositories on creation and provides a query interface.
 *
 * @template D - The type of dependencies/infrastructure
 * @param config - Container configuration containing:
 *   - `id`: Unique identifier for the container
 *   - `dependencies`: Infrastructure dependencies to inject into all repositories
 *   - `repositories`: Object mapping repository IDs to factory functions
 *   - `logging`: Optional flag to enable/disable logging (default: false)
 * @returns Container instance with `queryRepository` method
 *
 * @example
 * ```typescript
 * const container = createContainerInstance({
 *   id: "app-container",
 *   dependencies: { httpClient: {...} },
 *   repositories: {
 *     userRepo: (deps) => ({ getUsers: () => deps.httpClient.get() }),
 *     postRepo: (deps) => ({ getPosts: () => deps.httpClient.get() })
 *   },
 *   logging: true
 * });
 * ```
 */
function createContainerInstance<D>(config: IManagerConfig<D>) {
  const { id, dependencies, repositories, logging } = config;
  const store = createStore<IRepositoryInstance>();
  const logger = createLogger({ logging: logging ?? false });
  const allRepositories = () =>
    Array.from(store.entries()).map(([id, repository]) => ({
      repository: id,
      connections: repository.getConnections(),
    }));
  logger.log(
    () => {
      Object.entries(repositories).forEach(([key, repository]) => {
        store.setState(key, createRepositoryInstance(repository, dependencies));
      });
    },
    {
      type: "repository.define",
      scope: id,
      metadata: () => {
        return {
          repositories: allRepositories().map(({ repository }) => ({
            repository,
          })),
        };
      },
    }
  );
  return {
    /**
     * Queries a repository by its ID and returns it with lifecycle management.
     * Automatically connects the repository (increments reference count) and provides
     * a disconnect method for cleanup.
     *
     * @param id - Repository identifier
     * @returns Object containing:
     *   - `repository`: The repository instance
     *   - `disconnect`: Function to disconnect and cleanup (decrements reference count)
     * @throws {Error} If repository is not found in the container
     *
     * @example
     * ```typescript
     * const { repository, disconnect } = container.queryRepository("userRepo");
     * 
     * // Use repository
     * await repository.getUsers();
     * 
     * // Cleanup when done
     * disconnect();
     * ```
     */
    queryRepository(id: string) {
      const repository = store.getState(id);
      const allRepositories = () =>
        Array.from(store.entries()).map(([id, repository]: any) => ({
          repository: id,
          connections: repository.getConnections(),
        }));
      if (!repository) {
        throw new Error(`Repository "${id}" not found`);
      }
      logger.log(() => repository.connect(), {
        type: "repository.connect",
        scope: id,
        metadata: () => {
          return {
            connections: allRepositories(),
          };
        },
      });
      return {
        repository: repository.getReference(),
        disconnect: () => {
          store.getState(id)?.disconnect();
        },
      };
    },
  };
}

export { createContainerInstance };
