import { createContext, useContext, useEffect, useState } from "react";
// eslint-disable-next-line no-unused-vars
import * as tf from "@tensorflow/tfjs";
import * as SpeechCommands from "@tensorflow-models/speech-commands";
import localforage from "localforage";
import { Snackbar } from "../components/medium/Snackbar";
import { ModifyModel } from "../components/layout/ModifyModel";

const Context = createContext();

export const ContextProvider = ({ children }) => {
  const [recognizer, setRecognizer] = useState();
  const [savedModel, setSavedModel] = useState([]);
  const [cachedModel, setCachedModel] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [activeRecognizer, setActiveRecognizer] = useState();
  const [openModal, setOpenModal] = useState(false);
  const [selectedModel, setSelectedModel] = useState("");
  const [alert, setAlert] = useState({ message: "", type: "" });

  const loadRecognizer = async () => {
    let recognizer = SpeechCommands.create("BROWSER_FFT");
    await recognizer.ensureModelLoaded();
    setRecognizer(recognizer);
    console.log(`Google Model Loaded`);
  };

  const loadSavedModels = async () => {
    const savedModelKeys = await SpeechCommands.listSavedTransferModels();
    setSavedModel(savedModelKeys);
  };

  useEffect(() => {
    localforage.config({
      driver: localforage.INDEXEDDB,
      name: "SpeechCommand",
      storeName: "SavedWords",
      description: "Speech Command Serialized Exemples",
    });
    loadRecognizer();
    loadSavedModels();
  }, []);

  return (
    <Context.Provider
      value={{
        recognizer,
        setAlert,
        savedModel,
        setSavedModel,
        openModal,
        setOpenModal,
        selectedModel,
        setSelectedModel,
        cachedModel,
        setCachedModel,
        isListening,
        setIsListening,
        activeRecognizer,
        setActiveRecognizer,
      }}
    >
      {children}
      <Snackbar message={alert.message} type={alert.type} setState={setAlert} />
      {openModal && <ModifyModel />}
    </Context.Provider>
  );
};

export const useContextProvider = () => useContext(Context);
