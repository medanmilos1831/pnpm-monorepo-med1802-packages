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
const app = manager.createContainer(
  infrastructure,
  (definition) => {
    definition("user-repo", (infrastructure) => {
      return {
        getUsers() {
          infrastructure.someHttpsModule.get();
        },
        createUser() {
          infrastructure.someHttpsModule.post();
        },
      };
    });
    definition("company-repo", (infrastructure) => {
      return {
        getCompanies() {
          infrastructure.someHttpsModule.get();
        },
        createCompany() {
          infrastructure.someHttpsModule.post();
        },
      };
    });
  },
  {
    logging: true, // Enable colored console logging
  }
);
// app.defineRepository("user-repo", (infrastructure) => {
//   return {
//     getUsers() {
//       console.log("GET USERS");
//     },
//   };
// });

app.queryRepository("user-repo").repository.getUsers();

const HomePage = () => {
  return <></>;
};

export { HomePage };
