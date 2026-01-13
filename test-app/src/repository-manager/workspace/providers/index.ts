import {
  createLogger,
  createScope,
  createStore,
  useScope,
} from "../infrastructure";
import type { IRepositoryInstance } from "../modules";
import type { IConfiguration } from "../types";

const repositoryScope = createScope<any>(undefined);

const repositoryProvider = (
  params: {
    config: IConfiguration;
    infrastructure: any;
    repositoryModule: any;
  },
  child: () => void
) => {
  const { config, infrastructure, repositoryModule } = params;
  const defaultConfig: IConfiguration = {
    id: config.id,
    logging: config.logging ?? false,
  };
  const logger = createLogger(defaultConfig);
  const store = createStore<IRepositoryInstance<any>>();
  repositoryScope.provider({
    value: {
      store,
      logger,
      infrastructure,
      repositoryModule,
    },
    children: child,
  });
};

const consumeRepositoryProvider = () => {
  const context = useScope(repositoryScope);
  return context;
};

export { repositoryScope, repositoryProvider, consumeRepositoryProvider };
