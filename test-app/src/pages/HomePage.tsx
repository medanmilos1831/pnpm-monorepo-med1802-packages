import { repositoryManager } from "../repository-manager";

interface IUserRepository {
  getUsers(id: string): void;
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
const { defineRepository, createContext, queryRepository } = manager.workspace(
  infrastructure,
  {
    id: "app-workspace",
    logging: false,
  }
);

defineRepository<IUserRepository, string>({
  id: "user-repo",
  install(infrastructure, ctx) {
    return {
      getUsers(params: string) {
        const value = ctx("contextid");
        console.log("CONTEXT VALUE", value);
        console.log("PARAMS", params);
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

const context = createContext<string>({
  id: "contextid",
  value: "CONTEXT VALUE",
});

context.provider({
  value: "PROVIDER VALUE 1",
  children: () => {
    let userRepo = queryRepository<IUserRepository>("user-repo");
    userRepo.repository.getUsers("*****IN CONTEXT 1*****");
  },
});

let userRepo = queryRepository<IUserRepository>("user-repo");
userRepo.repository.getUsers("*****OUT OF CONTEXT*****");

const HomePage = () => {
  return <></>;
};

export { HomePage };
