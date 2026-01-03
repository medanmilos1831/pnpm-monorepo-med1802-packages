import { HomePage } from "./pages/HomePage";
import { repositoryManager } from "@med1802/repository-manager";
function App() {
  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        backgroundColor: "black",
        color: "white",
      }}
    >
      <HomePage />
    </div>
  );
}

export { App };
