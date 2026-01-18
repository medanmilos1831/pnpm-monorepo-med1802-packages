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
    const { infrastructure, broker } = instance;
    let status = "resume";
    // const subscribeOne = broker.consumer({
    //   topic: "user-repo",
    //   callback: (message: any) => {
    //     console.log("SUBSCRIBED ONE", message);
    //   },
    // });
    setTimeout(() => {
      const subscribeOne = broker.consumer({
        topic: "user-repo",
        callback: (message: any) => {
          console.log("SUBSCRIBED ONE", message);
        },
      });
    }, 1000);
    return {
      getUsers(params) {
        // console.log("GET USERS", params);
        new Array(5).fill(0).forEach(() => {
          broker.publish({
            topic: "user-repo",
            source: "from-method",
            payload: { userId: 1 },
          });
        });
        // setTimeout(() => {
        //   new Array(1).fill(0).forEach(() => {
        //     broker.publish({
        //       topic: "user-repo",
        //       source: "from-method",
        //       payload: { userId: 2 },
        //     });
        //   });
        // }, 5000);
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

let userRepo = queryRepository<IUserRepository>("user-repo");
// let userRepoTwo = queryRepository<IUserRepository>("user-repo");
userRepo.repository.getUsers(123);
// userRepoTwo.repository.getUsers(321);

const HomePage = () => {
  return <></>;
};

export { HomePage };
