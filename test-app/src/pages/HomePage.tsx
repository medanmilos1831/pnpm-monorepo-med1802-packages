import { Button, Modal } from "antd";
import { toggleRepository } from "../framework-toggle";
const { useToggle, getToggle } = toggleRepository({
  log: true,
});
const ModalComponent = () => {
  const [isOpen, close, message] = useToggle({
    id: "test",
    initialState: false,
  });
  console.log("MODAL COMPONENT MESSAGE", message);
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
