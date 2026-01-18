import { HomePage } from "./pages/HomePage";
import { createContext, useContext } from "react";
import { repositoryManager } from "@med1802/repository-manager";
let E = createContext(2);

function App() {
  // const r = useContext(E);
  // console.log("eeee", useContext);
  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        backgroundColor: "black",
        color: "white",
      }}
    >
      {/* <E.Provider value={12}></E.Provider> */}
      <HomePage />
    </div>
  );
}

export { App };
