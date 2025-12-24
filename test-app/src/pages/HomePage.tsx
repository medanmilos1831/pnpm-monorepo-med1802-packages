import { repositoryManager } from "../repository-manager";

const manager = repositoryManager();
const infrastructure = {
  someHttpsModule: {
    get() {
      console.log("GET");
    },
  },
};
const app = manager.createContainer(infrastructure, {
  logging: true, // Enable colored console logging
});
app.defineRepository("user-repo", (infrastructure) => {
  return {
    getUsers() {
      console.log("GET USERS");
    },
  };
});

const HomePage = () => {
  return <></>;
};

export { HomePage };
