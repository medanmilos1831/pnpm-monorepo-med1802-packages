import { Button, Modal } from "antd";
import { toggleRepository } from "../framework-toggle";
import { useEffect, useState } from "react";
const { useToggle, getToggle, useToggleSelector } = toggleRepository({
  log: false,
});
const ModalComponent = () => {
  const [count, setCount] = useState(0);
  const { open, close } = useToggle({
    id: "test",
    initialState: {
      open: true,
      message: undefined,
    },
  });
  const value = useToggleSelector({
    id: "test",
    selector: (state) => {
      // console.log("COUNTER", count);
      return {
        open: state.open,
        message: state.message,
        count: count,
      };
    },
  });
  console.log("value", value);
  return (
    <>
      <></>
      <p>Is Open: {value.open ? "Yes" : "No"}</p>
      <p>Count: {count}</p>
      <Button onClick={() => setCount(count + 1)}>Increment</Button>
      {/* <Modal
        closable={false}
        open={isOpen}
        onCancel={() => close("User cancelled")}
        onOk={() => close("User confirmed")}
      >
        <h1>Modal</h1>
      </Modal> */}
    </>
  );
};

const ButtonHandler = () => {
  const item = getToggle("test");
  console.log("item", item);
  return (
    <>
      <Button onClick={() => item.open("OPEN MODAL")}>Open Modal</Button>
      <Button onClick={() => item.close("CLOSE MODAL")}>Close Modal</Button>
    </>
  );
};

// const store = new Store({
//   open: false,
//   message: undefined,
// });

// console.log("STORE", store);

const HomePage = () => {
  return (
    <>
      <ModalComponent />
      <ButtonHandler />
    </>
  );
};

export { HomePage };
