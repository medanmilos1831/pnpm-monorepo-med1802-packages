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

manager.createContext({
  id: "contextid",
  value: "some-context-value",
  workspace: "app-workspace",
  create(workspace: any) {
    // manager.createContext({
    //   id: "contextid2",
    //   value: "some-context-value2",
    //   workspace: "app-workspace",
    //   create(workspace) {
    //     let userRepo = manager.query<IUserRepository>(workspace + "/user-repo");
    //     userRepo.repository.getUsers(1);
    //   },
    // });
    let userRepo = manager.query<IUserRepository>(workspace + "/user-repo");
    userRepo.repository.getUsers(1);
  },
});

// let userRepo = manager.query<IUserRepository>("app-workspace/user-repo");
// userRepo.repository.getUsers(3);

const HomePage = () => {
  return <></>;
};

export { HomePage };
