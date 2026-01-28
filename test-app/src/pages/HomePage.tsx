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
const { queryRepository } = manager.workspaceClient({
  id: "app-workspace",
  logging: false,
  dependencies,
  onSetup({ useRepository }){
    useRepository<IUserRepository>({
      id: "user-repo",
      install({ instance }) {
        const { dependencies, signal } = instance;
        return {
          getUsers(params) {
            console.log("GET USERS", params);
            signal({
              type: "user.get",
              repositoryId: "contract-repo",
              message: 123
            });
          },
        };
      },
    });
    useRepository<IContractRepository>({
      id: "contract-repo",
      onSignal(event, repo) {
        console.log("SUBSCRIBE", event);
        repo.getContracts(123);
      },
      install({ instance }) {
        const { dependencies, signal } = instance;
        return {
          getContracts(params) {
            console.log("GET CONTRACTS", params);
          },
        };
      },
    });
  }
});

let userRepository = queryRepository<IUserRepository>("user-repo");
let contractRepository = queryRepository<IContractRepository>("contract-repo");
userRepository.repository.getUsers(1);

const HomePage = () => {
  return <></>;
};

export { HomePage };
