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
        console.log("GET USERS", params);
        console.log("OBSERVER", observer);
        observer.dispatch("company-repo", { userId: 123 });
      },
    };
  },
  onConnect: () => {
    console.log("ON CONNECT USER REPO");
  },
  onDisconnect: () => {
    console.log("ON DISCONNECT");
  },
  middlewares: [],
});

defineRepository<ICompanyRepository>({
  id: "company-repo",
  install({ instance }) {
    const { infrastructure, observer } = instance;
    observer.subscribe("user-repo", (payload: any) => {
      console.log("SUBSCRIBED USER REPO", payload);
    });
    return {
      getCompanies(params) {},
    };
  },
  onConnect: () => {
    console.log("ON CONNECT COMPANY REPO");
  },
  onDisconnect: () => {
    console.log("ON DISCONNECT");
  },
  middlewares: [],
});

let userRepo = queryRepository<IUserRepository>("user-repo");
let companyRepo = queryRepository<ICompanyRepository>("company-repo");
// let userRepoTwo = queryRepository<IUserRepository>("user-repo");
userRepo.repository.getUsers(123);
// userRepoTwo.repository.getUsers(321);

const HomePage = () => {
  return <></>;
};

export { HomePage };
