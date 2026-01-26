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
  logging: false,
  dependencies,
  onMount({ useRepository }){
    useRepository<IUserRepository>({
      id: "user-repo",
      install({ instance }) {
        const { dependencies, messenger } = instance;
        return {
          getUsers(params) {
            console.log("GET USERS", params);
            messenger.dispatch({
              type: "user.get",
              repositoryId: "contract-repo",
              message: 'kita'
            });
          },
        };
      },
    });
    useRepository<IContractRepository>({
      id: "contract-repo",
      subscribe(event, repo) {
        console.log("SUBSCRIBE", event);
        repo.getContracts(123);
      },
      install({ instance }) {
        const { dependencies, messenger } = instance;
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
