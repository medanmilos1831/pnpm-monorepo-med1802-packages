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
defineRepository(
  "user-repo",
  (infrastructure) => {
    return {
      getUsers(id: number) {
        console.log("GET USERS", id);
        infrastructure.someHttpsModule.get();
      },
    };
  },
  {
    // lifecycle: {
    //   onConnect() {
    //     console.log("ON CONNECT");
    //   },
    //   onDisconnect() {
    //     console.log("ON DISCONNECT");
    //   },
    // },
    middlewares: [
      (target, prop: string, args: any[], next: any) => {
        console.log("MIDDLEWARE 1", args);
        next(1);
      },
      (target, prop: string, args: any[], next: any) => {
        console.log("MIDDLEWARE 2", args);
        next(2);
      },
    ],
  }
);

let userRepo = manager.query<IUserRepository>("app/user-repo");
userRepo.repository.getUsers(0);
const HomePage = () => {
  return <></>;
};

export { HomePage };
