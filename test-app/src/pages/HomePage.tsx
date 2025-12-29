import { repositoryManager } from "../repository-manager";

interface IUserRepository {
  getUsers(): void;
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
      getUsers() {
        infrastructure.someHttpsModule.get();
      },
    };
  },
  {
    lifecycle: {
      onConnect() {
        console.log("ON CONNECT");
      },
      onDisconnect() {
        console.log("ON DISCONNECT");
      },
    },
  }
);

let userRepoOne = manager.query<IUserRepository>("app/user-repo");
let userRepoTwo = manager.query<IUserRepository>("app/user-repo");

userRepoOne.disconnect();
userRepoTwo.disconnect();

const HomePage = () => {
  return <></>;
};

export { HomePage };
