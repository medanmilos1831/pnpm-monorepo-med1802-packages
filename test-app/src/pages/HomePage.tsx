import { useEffect, useState } from "react";
import { toggleRepository } from "../framework-toggle";
import { Button, Modal } from "antd";
const { useToggle, useMiddleware, getToggle } = toggleRepository({
  log: false,
  middlewares: {
    someMiddleware: ({ resolve, reject }: any) => {
      resolve((value: any, payload: any) => {
        return {
          ...payload,
          dataFromSomeComponent: value,
        };
      });
    },
  },
});
const ModalComponent = () => {
  const [isOpen, close, message] = useToggle({
    id: "test",
    initialState: false,
  });
  console.log("message", message);
  return (
    <>
      <Modal
        closable={false}
        open={isOpen}
        onCancel={() => close("User cancelled")}
        onOk={() => close("User confirmed")}
      >
        <h1>Modal</h1>
      </Modal>
    </>
  );
};

const SomeComponent = () => {
  useMiddleware({
    toggleId: "test",
    use: "someMiddleware",
    value: 222,
  });
  return (
    <>
      <h1>Some Component</h1>
    </>
  );
};

const ButtonHandler = () => {
  const item = getToggle("test");
  return (
    <>
      <Button onClick={() => item.open("OPEN MODAL")}>Open Modal</Button>
    </>
  );
};

const HomePage = () => {
  return (
    <>
      <ModalComponent />
      <SomeComponent />
      <ButtonHandler />
    </>
  );
};

export { HomePage };
