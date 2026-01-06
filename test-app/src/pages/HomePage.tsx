import { repositoryManager } from "../repository-manager";

interface IUserRepository {
  getUsers(id: number): void;
}

const manager = repositoryManager();
const infrastructure = {
  someHttpsModule: {
    get() {
      console.log("GET");
    },
    post() {
      console.log("POST");
    },
  },
};
const { defineRepository } = manager.workspace(infrastructure, {
  id: "app-workspace",
  logging: false,
});

defineRepository<IUserRepository>({
  id: "user-repo",
  install(infrastructure, ctx) {
    return {
      getUsers(id: number) {
        const value = ctx("contextid");
        console.log("VALUE", value, id);
        // infrastructure.someHttpsModule.get();
      },
    };
  },
  onConnect: () => {
    // console.log("ON CONNECT");
  },
  onDisconnect: () => {
    console.log("ON DISCONNECT");
  },
  middlewares: [],
});

const context = manager.createContext({
  id: "contextid",
  value: "CONTEXT VALUE",
  workspace: "app-workspace",
});

context.provider("PROVIDER VALUE", () => {
  let userRepo = manager.query<IUserRepository>("app-workspace/user-repo");
  userRepo.repository.getUsers(3);
});

// let userRepo = manager.query<IUserRepository>("app-workspace/user-repo");
// userRepo.repository.getUsers(3);

const HomePage = () => {
  return <></>;
};

export { HomePage };
