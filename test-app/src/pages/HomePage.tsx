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
const { defineRepository, createScope, queryRepository } = manager.workspace(
  infrastructure,
  {
    id: "app-workspace",
    logging: false,
  }
);

const userScope = createScope({
  fname: "Milos",
});
const companyScope = createScope({
  name: "Company Name",
});

defineRepository<IUserRepository>({
  id: "user-repo",
  install({ instance }) {
    const { infrastructure, useScope } = instance;
    return {
      getUsers(params) {
        console.log("GET USERS", params);
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

// userScope.provider({
//   value: {
//     fname: "MARKO",
//   },
//   children() {
//     let userRepo = queryRepository<IUserRepository>("user-repo");
//     userRepo.repository.getUsers("*****IN CONTEXT*****");
//   },
// });

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

let userRepo = queryRepository<IUserRepository>("user-repo");
userRepo.repository.getUsers(123);

const HomePage = () => {
  return <></>;
};

export { HomePage };
