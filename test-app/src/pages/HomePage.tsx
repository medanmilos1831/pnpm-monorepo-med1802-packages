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
const { defineRepository, queryRepository } = manager.createWorkspace({
  id: "app-workspace",
  logging: false,
  infrastructure,
});
defineRepository<IUserRepository>({
  id: "user-repo",
  install({ instance }) {
    const { infrastructure, observer } = instance;

    return {
      getUsers(params) {
        observer.dispatch<{
          userId: number;
        }>({
          type: "getUsers",
          repositoryId: "company-repo",
          message: { userId: 1 },
        });
      },
    };
  },
  onConnect: () => {
    // console.log("ON CONNECT USER REPO");
  },
  onDisconnect: () => {
    // console.log("ON DISCONNECT");
  },
  middlewares: [],
});

defineRepository<ICompanyRepository>({
  id: "company-repo",
  install({ instance }) {
    const { infrastructure, observer } = instance;
    let obj: ICompanyRepository = {
      getCompanies(params) {
        console.log("GET COMPANIES", params);
      },
    };
    observer.subscribe<{
      userId: number;
    }>((data) => {
      console.log("SUBSCRIBED COMPANY REPO", data);
      // obj.getCompanies(payload.data);
    });
    return obj;
  },
  onConnect: () => {
    // console.log("ON CONNECT COMPANY REPO");
  },
  onDisconnect: () => {
    console.log("ON DISCONNECT");
  },
  middlewares: [],
});

let companyRepo = queryRepository<ICompanyRepository>("company-repo");
let userRepo = queryRepository<IUserRepository>("user-repo");
// let userRepoTwo = queryRepository<IUserRepository>("user-repo");
userRepo.repository.getUsers(123);
// userRepoTwo.repository.getUsers(321);

const HomePage = () => {
  return <></>;
};

export { HomePage };
