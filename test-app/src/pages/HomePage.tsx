import { repositoryManager } from "../repository-manager";

interface IHttpsModule {
  get(): void;
  post(): void;
}

interface IInfrastructure {
  someHttpsModule: IHttpsModule;
}

const manager = repositoryManager();
const app = manager.createContainer<IInfrastructure>({
  infrastructure: {
    someHttpsModule: {
      get() {
        console.log("GET");
      },
      post() {
        console.log("POST");
      },
    },
  },
});

app.defineRepository("user-repo", (infrastructure) => {
  return {
    getUsers() {
      infrastructure.someHttpsModule.get();
    },
    createUser() {
      infrastructure.someHttpsModule.post();
    },
  };
});

app.connectRepository("user-repo");
app.connectRepository("user-repo");
app.connectRepository("user-repo");
app.connectRepository("user-repo");
app.connectRepository("user-repo");
app.disconnectRepository("user-repo");
app.disconnectRepository("user-repo");
app.disconnectRepository("user-repo");
app.disconnectRepository("user-repo");

// console.log("USER REPO", userRepo);
// userRepo.getUsers();
// userRepo.getUsers();
// app.disconnectRepository("user-repo");
// userRepo.getUsers();
// userRepo.createUser();

const HomePage = () => {
  return <></>;
};

export { HomePage };
