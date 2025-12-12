import { toggleRepository } from "../framework-toggle";
const { useToggle } = toggleRepository({ log: true });
const HomePage = () => {
  const w = useToggle({
    id: "toggle",
    initialState: { open: false, message: "test" },
  });
  return <></>;
};

export { HomePage };
