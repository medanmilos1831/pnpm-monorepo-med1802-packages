import { repositoryManager } from "../repository-manager";

interface IUserRepository {
  getUsers(id: number): void;
}

interface ICompanyRepository {
  getCompanies(id: number): void;
}

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
const { queryRepository } = manager.createWorkspace({
  id: "app-workspace",
  logging: false,
  infrastructure,
  repositories: () => {
    return [
      {
        id: "user-repo",
        install({ instance }): IUserRepository {
          const { infrastructure, observer } = instance;

          return {
            getUsers(params) {
              console.log("NEW QUERY REPO", params);
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
    ];
  },
});
// defineRepository<IUserRepository>({
//   id: "user-repo",
//   install({ instance }) {
//     const { infrastructure, observer } = instance;

//     return {
//       getUsers(params) {
//         observer.dispatch<{
//           userId: number;
//         }>({
//           type: "getUsers",
//           repositoryId: "company-repo",
//           message: { userId: 1 },
//         });
//       },
//     };
//   },
//   onConnect: () => {
//     // console.log("ON CONNECT USER REPO");
//   },
//   onDisconnect: () => {
//     // console.log("ON DISCONNECT");
//   },
//   middlewares: [],
// });

// defineRepository<ICompanyRepository>({
//   id: "company-repo",
//   install({ instance }) {
//     const { infrastructure, observer } = instance;
//     let obj: ICompanyRepository = {
//       getCompanies(params) {
//         console.log("GET COMPANIES", params);
//       },
//     };
//     observer.subscribe<{
//       userId: number;
//     }>((data) => {
//       console.log("SUBSCRIBED COMPANY REPO", data);
//       // obj.getCompanies(payload.data);
//     });
//     return obj;
//   },
//   onConnect: () => {
//     // console.log("ON CONNECT COMPANY REPO");
//   },
//   onDisconnect: () => {
//     console.log("ON DISCONNECT");
//   },
//   middlewares: [],
// });

let x = queryRepository<IUserRepository>("user-repo");
x.repository.getUsers(1);
// console.log("X", x);

const HomePage = () => {
  return <></>;
};

export { HomePage };
