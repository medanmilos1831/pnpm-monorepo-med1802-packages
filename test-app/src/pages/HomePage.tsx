import { createRepositoryManager } from "../repository-manager";

interface IUserRepo {
  getUsers(): void;
  createUser(): void;
}

const manager = createRepositoryManager();
let r = manager.createContainer({
  id: "infra-container",
  dependencies: {
    axios: {
      get() {
        console.log("GET");
      },
      post() {
        console.log("POST");
      },
    },
  },
  repositories: {
    userRepo(infra) {
      return {
        getUsers() {
          console.log("GET USERS", infra);
        },
      };
    },
    countryRepo(infra) {
      return {
        getCountries() {
          console.log("GET COUNTRIES", infra);
        },
      };
    },
    djoka(infra) {
      return {
        getCountries() {
          console.log("djoka", infra);
        },
      };
    },
  },
  logging: true,
});
console.log(
  r
    .queryRepository<{ getCountries: () => void }>("djoka")
    .repository.getCountries()
);
// const userRepo = manager.queryRepository<IUserRep  o>("infra-container/userRepo");
// console.log(userRepo.repository.getUsers);
// console.log(userRepo.repository.getUsers());
// console.log(manager.query<IUserRepo>("infra-container/userRdsepo"));
// const userRepo = manager.query("infra-container/userRepo");
// userRepo.repository.getUsers();

// const app = manager.createContainer<IInfrastructure>(
//   {
//     httpClient: {
//       get() {
//         console.log("GET");
//       },
//       post() {
//         console.log("POST");
//       },
//     },
//   },
//   {
//     logging: false,
//   }
// );

// app.defineRepository("user-repo", (infrastructure) => {
//   return {
//     getUsers() {
//       infrastructure.httpClient.get();
//     },
//     createUser() {
//       infrastructure.httpClient.post();
//     },
//   };
// });
// app.defineRepository("country-repo", (infrastructure) => {
//   return {
//     getCountries() {
//       infrastructure.httpClient.get();
//     },
//     createCountry() {
//       infrastructure.httpClient.post();
//     },
//   };
// });

// const userRepoOne = app.queryRepository<IUserRepo>("user-repo");
// const userRepoTwo = app.queryRepository<IUserRepo>("user-repo");
// const pera = userRepoOne.repository.getUsers();
// console.log(pera);

const HomePage = () => {
  return <></>;
};

export { HomePage };
