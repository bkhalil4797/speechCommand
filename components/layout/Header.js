import { useState, useRef } from "react";
import { useContextProvider } from "../../context";
import { DropDown } from "../medium/DropDown";
import { Button } from "../small/Button";
import { Input } from "../small/Input";

export const Header = () => {
  const { savedModel, setSelectedModel, setOpenModal, setAlert } =
    useContextProvider();
  const [create, setCreate] = useState(false);
  const [load, setLoad] = useState(false);
  const inputRef = useRef();

  const handleCreate = () => {
    if (inputRef.current.value.length < 3) {
      setAlert({
        message: "Le nom doit contenir en moins 3 charactere",
        type: "error",
      });
      return;
    }
    const formatedSavedModel = savedModel.map((model) =>
      model.substring(0, model.length - 5).toLowerCase()
    );
    if (formatedSavedModel.includes(inputRef.current.value.toLowerCase())) {
      setAlert({
        message: `le Modele " ${inputRef.current.value} " est déja existant`,
      });
      return;
    }
    setSelectedModel(`${inputRef.current.value.toLowerCase()} v001`);
    setOpenModal(true);
    setCreate(false);
    inputRef.current.value = "";
  };

  const handleModify = (name) => {
    setSelectedModel(name);
    setOpenModal(true);
    setLoad(false);
  };

  return (
    <div className="header">
      <h1>Modele</h1>
      <div>
        <Button text="Creer un Modele" state={create} setState={setCreate} />
        <DropDown open={create} setOpen={setCreate}>
          <div className="container" style={{ justifyContent: "center" }}>
            <Input placeholder="Nom du Modele" inputRef={inputRef} />
            <Button text="Creer" onClick={handleCreate} />
          </div>
        </DropDown>
      </div>
      <div>
        <Button text="Modifier un modele" state={load} setState={setLoad} />
        <DropDown open={load} setOpen={setLoad}>
          <div className="container">
            {savedModel.length > 0 ? (
              savedModel.map((model) => (
                <Button
                  text={`${model
                    .substring(0, 1)
                    .toUpperCase()}${model.substring(1, model.length - 5)}`}
                  key={model}
                  onClick={() => handleModify(model)}
                />
              ))
            ) : (
              <p>Il n{"'"}y a pas de modele enregistrer</p>
            )}
          </div>
        </DropDown>
      </div>
    </div>
  );
};
