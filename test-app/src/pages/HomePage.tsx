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
const { defineRepository, createScope, queryRepository, useScope } =
  manager.workspace(infrastructure, {
    id: "app-workspace",
    logging: false,
  });

const userScope = createScope({
  fname: "Milos",
});

defineRepository({
  id: "user-repo",
  install(infrastructure, uScope) {
    return {
      getUsers(params: string) {
        // console.log("PARAMS", params);
        // console.log("USE SCOPE", useScope);
        const value = uScope(userScope);
        // console.log("VALUE", value);
        // const value = ctx("contextid");
        // console.log("CONTEXT VALUE", value);
        // console.log("PARAMS", params);
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

userScope.provider({
  value: {
    fname: "MARKO",
  },
  children() {
    let userRepo = queryRepository<IUserRepository>("user-repo");
    userRepo.repository.getUsers("*****IN CONTEXT*****");
  },
});

// const context = createContext<string>({
//   id: "contextid",
//   value: "CONTEXT VALUE",
// });

// context.provider({
//   value: "PROVIDER VALUE 1",
//   children: () => {
//     let userRepo = queryRepository<IUserRepository>("user-repo");
//     userRepo.repository.getUsers("*****IN CONTEXT 1*****");
//   },
// });

// let userRepo = queryRepository<IUserRepository>("user-repo");
// userRepo.repository.getUsers("*****OUT OF CONTEXT*****");

const HomePage = () => {
  return <></>;
};

export { HomePage };
