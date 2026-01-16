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
    const { connect, run, disconnect } = broker.subscribeNew({
      scope: "user-repo",
      eventName: "userLoggedIn",
    });
    const some = broker.subscribeNew({
      scope: "user-repo",
      eventName: "userLoggedIn",
    });
    connect();
    some.connect();
    run(() => {
      console.log("RUN 1");
    });
    run(() => {
      console.log("RUN 2");
    });
    disconnect();
    run(() => {
      console.log("RUN 3");
    });
    some.run(() => {
      console.log("kita RUN 1");
    });
    some.run(() => {
      console.log("kita RUN 2");
    });
    some.run(() => {
      console.log("kita RUN 3");
    });

    // disconnect();
    // setTimeout(() => {
    //   broker.subscribe({
    //     fromBeginning: true,
    //     scope: "user-repo",
    //     eventName: "userLoggedIn",
    //     callback: (payload) => {
    //       console.log("SUBSCRIBED after", payload);
    //     },
    //   });
    // }, 1000);

    // setTimeout(() => {
    //   broker.publish({
    //     scope: "user-repo",
    //     source: "user-repo",
    //     eventName: "userLoggedIn",
    //     payload: { userId: 2 },
    //   });
    // }, 2000);

    // broker.subscribe({
    //   scope: "user-repo",
    //   eventName: "userLoggedIn",
    //   callback: (payload) => {
    //     console.log("before", payload);
    //   },
    // });
    // broker.subscribe({
    //   scope: "user-repo",
    //   eventName: "userLoggedIn",
    //   callback: (payload) => {
    //     console.log("SUBSCRIBED", payload);
    //   },
    // });
    return {
      getUsers(params) {
        // console.log("GET USERS", params);
        new Array(1).fill(0).forEach(() => {
          broker.publish({
            scope: "user-repo",
            source: "user-repo",
            eventName: "userLoggedIn",
            payload: { userId: 1 },
          });
        });
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
