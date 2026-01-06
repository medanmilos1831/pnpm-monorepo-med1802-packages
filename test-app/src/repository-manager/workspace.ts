import { createLogger } from "./logger";
import { createRepositoryAccessor } from "./repositoryAccessor";
import { createStore } from "./store";
import type {
  IConfiguration,
  IContextConfig,
  IContextProviderOptions,
  IRepositoryInstance,
  IRepositoryPlugin,
  repositoryType,
} from "./types";

function createWorkspace<I extends Record<string, any>>(
  infrastructure: I,
  config: IConfiguration
) {
  const defaultConfig: IConfiguration = {
    id: config.id,
    logging: config.logging ?? false,
  };
  const logger = createLogger(defaultConfig);
  const store = createStore<IRepositoryInstance<any>>();
  const contextStore = createStore<IContextConfig<any>[]>();
  contextStore.setState("stack", []);
  function hasRepository(id: string) {
    return store.hasState(id);
  }
  function allRepositories() {
    return Array.from(store.getEntries()).map(([id, repository]) => ({
      repository: id,
      connections: repository.connections,
    }));
  }

  function defineRepository<R = any, C = any>(
    repositoryPlugin: IRepositoryPlugin<I, R>
  ) {
    const { id } = repositoryPlugin;
    if (hasRepository(id)) return;
    logger.log(
      () => {
        store.setState(
          id,
          createRepositoryAccessor(
            infrastructure,
            repositoryPlugin,
            (id: string) => {
              const value = contextStore.getState("stack")!;
              let result = value.filter((item: any) => item.id === id);
              return result[result.length - 1]?.value as C;
            }
          )
        );
      },
      {
        type: "repository.define",
        scope: id,
        metadata() {
          return {
            repositories: allRepositories().map(({ repository }) => ({
              repository,
            })),
          };
        },
      }
    );
  }

  function queryRepository<R = any>(id: string) {
    const entity = store.getState(id);
    if (!entity) {
      throw new Error(`Repository "${id}" not found`);
    }
    logger.log(() => entity.connect(), {
      type: "repository.connect",
      scope: id,
      metadata: () => {
        return {
          connections: allRepositories(),
        };
      },
    });
    const { repository } = entity;
    return {
      repository: repository as ReturnType<repositoryType<I, R>>,
      disconnect() {
        entity.disconnect();
      },
    };
  }

  function createContext<V = any>(config: IContextConfig<V>) {
    return {
      provider(options: IContextProviderOptions) {
        const { value, children } = options;
        const stack = contextStore.getState("stack");
        if (!stack) {
          throw new Error("Context stack not found");
        }
        try {
          stack.push(value ? { ...config, value } : config);
          children();
        } finally {
          stack.pop();
        }
      },
    };
  }

  return {
    defineRepository,
    queryRepository,
    createContext,
  };
}

export { createWorkspace };
