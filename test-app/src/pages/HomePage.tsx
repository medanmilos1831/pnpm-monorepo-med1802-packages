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
defineRepository("user-repo", (infrastructure) => {
  return {
    getUsers() {
      infrastructure.someHttpsModule.get();
    },
  };
});

let userRepo = manager.query<IUserRepository>("app/user-repo");
console.log(userRepo.repository);
const HomePage = () => {
  return <></>;
};

export { HomePage };
