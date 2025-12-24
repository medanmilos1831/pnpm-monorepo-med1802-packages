import { createRepositoryManager } from "../repository-manager";

interface IUserRepo {
  getUsers(): void;
  createUser(): void;
}

const manager = createRepositoryManager([
  {
    id: "infra-container",
    dependencies: {
      httpClient: {
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
      countryRepo(infra: any) {
        console.log(infra);
        return {
          getCountries() {
            console.log("GET COUNTRIES");
          },
        };
      },
    },
    logging: false,
  },
]);
const userRepo = manager.query<IUserRepo>("infra-container/userRepo");
console.log(userRepo);
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
