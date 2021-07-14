import { Header } from "../components/layout/Header";
import { CustomInput } from "../components/medium/CustomInput";

export default function Home() {
  return (
    <>
      <Header />
      <CustomInput />
      <div style={{ margin: "20px" }}></div>
      <CustomInput />
    </>
  );
}
