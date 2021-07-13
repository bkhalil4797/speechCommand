import { createContext, useContext, useEffect, useState } from "react";
// eslint-disable-next-line no-unused-vars
import * as tf from "@tensorflow/tfjs";
import * as SpeechCommands from "@tensorflow-models/speech-commands";
import localforage from "localforage";

const Context = createContext();

export const ContextProvider = ({ children }) => {
  const [recognizer, setRecognizer] = useState();

  const loadRecognizer = async () => {
    let recognizer = SpeechCommands.create("BROWSER_FFT");
    await recognizer.ensureModelLoaded();
    setRecognizer(recognizer);
    console.log(`Google Model Loaded`);
  };

  useEffect(() => {
    localforage.config({
      driver: localforage.INDEXEDDB,
      name: "SpeechCommand",
      storeName: "SavedWords",
      description: "Speech Command Serialized Exemples",
    });
    loadRecognizer();
  }, []);

  return <Context.Provider value={recognizer}>{children}</Context.Provider>;
};

export const useContextProvider = () => useContext(Context);
