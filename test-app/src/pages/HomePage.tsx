import { repositoryManager } from "../repository-manager";

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
const app = manager.createContainer(infrastructure, {
  id: "app",
  logging: false, // Enable colored console logging
});
app.defineRepository("user-repo", (infrastructure) => {
  return {
    getUsers() {
      infrastructure.someHttpsModule.get();
    },
  };
});

console.log(manager);
manager.query("app/user-repo");

const HomePage = () => {
  return <></>;
};

export { HomePage };
