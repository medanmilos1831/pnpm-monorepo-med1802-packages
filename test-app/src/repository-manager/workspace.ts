import { createLogger } from "./logger";
import { createRepositoryAccessor } from "./repositoryAccessor";
import { createStore } from "./store";
import type {
  IConfiguration,
  IContext,
  IRepositoryInstance,
  IRepositoryPlugin,
  IWorkspace,
} from "./types";
import type { queryRepositoryType } from "./types";

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
  const contextStore = createStore<IContext[]>();
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

  function defineRepository<R = any>(
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
            (id: any) => {
              const value = contextStore.getState("stack")!;
              let result = value.filter((item: any) => item.id === id);
              console.log("RESULT", result[0]?.value);
              return result[0]?.value;
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

  function queryRepository(id: string) {
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
      repository,
      disconnect() {
        entity.disconnect();
      },
    };
  }

  function createContext<V = any>(config: IContext<V>) {
    return {
      provider(value: any, create: (value: any) => void) {
        const stack = contextStore.getState("stack");
        if (!stack) {
          throw new Error("Context stack not found");
        }
        try {
          if (value) {
            config.value = value;
          }
          stack.push(config);
          create(config.workspace);
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
