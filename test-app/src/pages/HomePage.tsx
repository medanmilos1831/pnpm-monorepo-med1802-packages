import { repositoryManager } from "../repository-manager";

interface IHttpsModule {
  get(): void;
  post(): void;
}

interface IUserRepo {
  getUsers(): void;
  createUser(): void;
}

interface ICountryRepo {
  getCountries(): void;
  createCountry(): void;
}

const manager = repositoryManager();
const app = manager.createContainer({
  someHttpsModule: {
    get() {
      console.log("GET");
    },
    post() {
      console.log("POST");
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
app.defineRepository("country-repo", (infrastructure) => {
  return {
    getCountries() {
      infrastructure.someHttpsModule.get();
    },
    createCountry() {
      infrastructure.someHttpsModule.post();
    },
  };
});

// const userRepoOne = app.queryRepository<IUserRepo>("user-repo");
// const userRepoTwo = app.queryRepository<IUserRepo>("user-repo");
// const userRepoThree = app.queryRepository<IUserRepo>("user-repo");
// const userRepoFour = app.queryRepository<IUserRepo>("user-repo");
// const userRepoFive = app.queryRepository<IUserRepo>("user-repo");
// userRepoOne.disconnect();

// app.queryRepository<IUserRepo>("user-repo");
// app.queryRepository<IUserRepo>("user-repo");

// userRepo.repository.getUsers();

const HomePage = () => {
  return <></>;
};

export { HomePage };
