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
  id: "app",
  logging: false,
});

defineRepository({
  id: "user-repo",
  install(infrastructure) {
    return {
      getUsers(id: number) {
        infrastructure.someHttpsModule.get();
      },
    };
  },
  onConnect: () => {
    console.log("ON CONNECT");
  },
  onDisconnect: () => {
    console.log("ON DISCONNECT");
  },
  middlewares: [],
  // lifecycle: {
  //   onConnect: () => {
  //     console.log("ON CONNECT");
  //   },
  //   onDisconnect: () => {
  //     console.log("ON DISCONNECT");
  //   },
  // },
});

let userRepo = manager.query<IUserRepository>("app/user-repo");
userRepo.repository.getUsers(0);
const HomePage = () => {
  return <></>;
};

export { HomePage };
