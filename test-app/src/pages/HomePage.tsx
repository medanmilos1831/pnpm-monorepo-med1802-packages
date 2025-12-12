import { core } from "../repository-core";
const toggleRepository = core.createRepository<
  number,
  { increment: () => void; getState: () => number }
>({
  log: false,
  createState(initialState) {
    return initialState;
  },
  model(context) {
    return {
      increment: () => {
        context.setState((prev) => prev + 1);
      },
      getState: () => {
        return context.getState();
      },
    };
  },
});
toggleRepository.createModel({
  id: "counter",
  initialState: 0,
});
let counterModel = toggleRepository.getModel("counter");
counterModel.increment();
console.log(counterModel.getState());
// const repo = createRepository<number, { incrementCounter: () => void }>({
//   log: false,
//   createState(initialState) {
//     return initialState;
//   },
// });
// const unsubscribe = repo.subscribe((state) => {
// });

// repo.createModel({
//   id: "counter",
//   initialState: 0,
// });
// let counterModel = repo.getModel("counter").setState((prev) => prev + 2);
// repo.getModel("counter").setState((prev) => prev + 2);
// repo.getModel("counter").setState((prev) => prev + 2);
// repo.getModel("counter").setState((prev) => prev + 2);
// console.log(repo.getModel("counter").getState());
// console.log(repo.getModel("home"));
// repo.createModel({
//   id: "home",
//   initialState: {
//     counter: 0,
//   },
// });
// const model = repo.getModel("home");
// const incrementCounter = () => {
//   model.store.setState((prev: any) => {
//     return {
//       ...prev,
//       counter: prev.counter + 1,
//     };
//   });
// };
// const unsubscribe = model.store.subscribe((state) => {
//   console.log("state changed", state);
// });

// incrementCounter();
// incrementCounter();
// incrementCounter();
// incrementCounter();
// unsubscribe();
// incrementCounter();
// incrementCounter();
// console.log(model.store.getState());
const HomePage = () => {
  return <></>;
};

export { HomePage };
