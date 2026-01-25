import { repositoryManager } from "../repository-manager";

interface IUserRepository {
  getUsers(id: number): void;
}

interface IContractRepository {
  getContracts(id: number): void;
}

const manager = repositoryManager();
const dependencies = {
  someHttpsModule: {
    get() {
      console.log("GET");
    },
    post() {
      console.log("POST");
    },
  },
};
const { queryRepository } = manager.createWorkspace({
  id: "app-workspace",
  logging: true,
  dependencies,
  repositories: () => {
    return [
      {
        id: "user-repo",
        install({ instance }): IUserRepository {
          const { dependencies, messenger } = instance;

          return {
            getUsers(params) {
              messenger.dispatch<{
                userId: number;
              }>({
                type: "getUsers",
                repositoryId: "contract-repo",
                message: { userId: 1 },
              });
            },
          };
        },
        onConnect: () => {
          console.log("%cON CONNECT USER REPO", "color: green");
        },
        onDisconnect: () => {
          console.log("ON DISCONNECT USER REPO");
        },
        middlewares: [],
      },
      {
        id: "contract-repo",
        install({ instance }): IContractRepository {
          const { dependencies, messenger } = instance;
          messenger.subscribe<{
            contractId: number;
          }>((data) => {
            console.log("SUBSCRIBED CONTRACT REPO", data);
          });
          return {
            getContracts(params) {
              console.log("GET CONTRACTS", params);
            },
          };
        },
        onConnect: () => {
          console.log("%cON CONNECT CONTRACT REPO", "color: green");
        },
        onDisconnect: () => {
          console.log("ON DISCONNECT CONTRACT REPO");
        },
        middlewares: [],
      },
    ];
  },
});

let userRepository = queryRepository<IUserRepository>("user-repo");
let contractRepository = queryRepository<IContractRepository>("contract-repo");
userRepository.repository.getUsers(1);

const HomePage = () => {
  return <></>;
};

export { HomePage };
