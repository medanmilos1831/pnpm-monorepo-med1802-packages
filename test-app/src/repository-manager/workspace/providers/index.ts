import { createContext } from "vm";

// const repositoryProvider = () => {
//   const zika = createContext({
//     id: "repository-provider",
//     value: {
//       nesto: 1,
//     },
//   });
//   return zika;
// };

const zika = createContext({
  id: "repository-provider",
  value: {
    nesto: 1,
  },
});
const zikaProvider = zika.provider;
export { zikaProvider };
