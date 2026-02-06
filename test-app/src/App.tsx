
import { createMessageBroker } from "./msg-broker";
import { HomePage } from "./pages/HomePage";

const { producer, consumer } = createMessageBroker();
producer({ topic: "test", message: "test" });
producer({ topic: "test", message: "test" });
producer({ topic: "test", message: "test" });


// consumer({
//   callback(message: any){
//     console.log('OVO JE MESSAGE', message);
//   },
//   topic: "test",
// });



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
