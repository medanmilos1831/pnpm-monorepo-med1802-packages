import { repositoryManager } from "../repository-manager";

interface IUserRepository {
  getUsers(id: number): void;
}

interface ICompanyRepository {
  getCompanies(id: number): void;
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
const { defineRepository, queryRepository } = manager.createWorkspace(
  infrastructure,
  {
    id: "app-workspace",
    logging: false,
  }
);
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

const workspaceTwo = manager.createWorkspace(infrastructure, {
  id: "app-two-workspace",
  logging: false,
});

workspaceTwo.defineRepository<ICompanyRepository>({
  id: "company-repo",
  install({ instance }) {
    const { infrastructure, useScope } = instance;
    return {
      getCompanies(params) {
        console.log("GET COMPANIES", params);
      },
    };
  },
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
let companyRepo =
  workspaceTwo.queryRepository<ICompanyRepository>("company-repo");
userRepo.repository.getUsers(123);
companyRepo.repository.getCompanies(544534);

const HomePage = () => {
  return <></>;
};

export { HomePage };
