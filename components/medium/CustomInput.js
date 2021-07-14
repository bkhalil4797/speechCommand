import { useState, useRef, useEffect, useCallback } from "react";
import { useContextProvider } from "../../context";
import styles from "../../styles/CustomInput.module.css";
import { Input } from "../small/Input";
import { Mic } from "../small/Mic";
import { More } from "../small/More";
import { SearchIcon } from "../small/SearchIcon";
import { DropDown } from "./DropDown";

export const CustomInput = () => {
  const {
    savedModel,
    recognizer,
    activeRecognizer,
    setActiveRecognizer,
    isListening,
    setIsListening,
    cachedModel,
    setCachedModel,
    setAlert,
  } = useContextProvider();
  const [more, setMore] = useState(false);
  const [mic, setMic] = useState(false);
  const [selectedModel, setSelectedModel] = useState("");
  const [micTimer, setMicTimer] = useState(3);
  const [recOneWord, setRecOneWord] = useState(false);
  const inputRef = useRef();

  const handleMicTimer = (e) => {
    if (e.target.value < 3) {
      setMicTimer(3);
    } else {
      setMicTimer(e.target.value);
    }
  };

  const timer = useCallback(
    (currentRecognizer) =>
      setTimeout(() => {
        currentRecognizer.stopListening();
        setIsListening(false);
        setMic(false);
      }, micTimer * 1000),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeRecognizer, micTimer]
  );

  const handleRecognizer = async () => {
    if (!isListening && !mic) {
      if (!savedModel.includes(selectedModel)) {
        setAlert({ message: "Aucun model selectionner" });
        return;
      }
      console.log("start recognizer");
      setIsListening(true);
      setMic(true);
      try {
        const alreadyLoaded = cachedModel.filter(
          (model) => model.name === selectedModel
        );
        let transfRec;
        if (alreadyLoaded.length > 0) {
          transfRec = alreadyLoaded[0].model;
          setActiveRecognizer(transfRec);
          console.log(`Model "${selectedModel}" loaded from cache`);
        } else {
          transfRec = recognizer.createTransfer(selectedModel);
          await transfRec.load();
          setActiveRecognizer(transfRec);
          setCachedModel([
            ...cachedModel,
            { name: selectedModel, model: transfRec },
          ]);
          console.log(`Model "${selectedModel}" loaded from indexedDb`);
        }
        const words = transfRec.wordLabels();
        transfRec.listen(
          ({ scores }) => {
            scores = Array.from(scores).map((s, i) => ({
              score: s,
              word: words[i],
            }));
            scores.sort((s1, s2) => s2.score - s1.score);
            console.log(`1:${scores[0]?.word}  -  2:${scores[1]?.word}`);
            inputRef.current.value = `${inputRef.current.value} ${scores[0]?.word}`;
            if (recOneWord) {
              transfRec.stopListening();
              setIsListening(false);
              setMic(false);
            }
          },
          {
            includeSpectrogram: true,
            probabilityThreshold: 0.8,
            invokeCallbackOnNoiseAndUnknown: true,
          }
        );
        if (!recOneWord) {
          timer(transfRec);
        }
      } catch (err) {
        console.log(err);
        setIsListening(false);
        setMic(false);
      }
      return;
    }
    if (isListening && !mic) {
      console.log("Le microphone est déja utilisé");
      setAlert({ message: "Le microphone est déja utilisé" });
      return;
    }
    if (isListening && mic) {
      try {
        if (!recOneWord) {
          clearTimeout(timer);
        }
        activeRecognizer.stopListening();
      } catch (err) {
        console.log(err);
      }
      console.log("stop mic");
      setIsListening(false);
      setMic(false);
      return;
    }
    if (!isListening && mic) {
      console.log("Cas impossible 'bug'");
      setMic(false);
      return;
    }
  };

  return (
    <>
      <div className={styles.container}>
        <SearchIcon />
        <Input
          inputRef={inputRef}
          style={{ width: "300px", fontSize: "18px" }}
        />
        <Mic state={mic} setState={setMic} onClick={handleRecognizer} />
        <More state={more} setState={setMore} />
        <DropDown open={more} setOpen={setMore}>
          <div className={styles.content}>
            <div>
              <p>Choisissez un modele</p>
              <select
                value={selectedModel}
                onChange={(e) => {
                  setSelectedModel(e.target.value);
                }}
              >
                <option value="">Aucun</option>
                {savedModel.length > 0 &&
                  savedModel.map((model) => (
                    <option key={model} value={model}>
                      {`${model.substring(0, 1).toUpperCase()}${model.substring(
                        1,
                        model.length - 5
                      )}`}
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <p>Reconnaitre un mot</p>
              <input
                type="checkbox"
                value={recOneWord}
                onChange={() => {
                  setRecOneWord(!recOneWord);
                }}
              />
            </div>
            <div>
              <p>Arreter le microphone apres</p>
              {/* All this to disable him*/}
              {!recOneWord ? (
                <input
                  type="number"
                  value={micTimer}
                  onChange={handleMicTimer}
                  className={styles.mictimer}
                  autoComplete="off"
                />
              ) : (
                <input
                  type="number"
                  value={micTimer}
                  onChange={handleMicTimer}
                  className={styles.mictimer}
                  autoComplete="off"
                  disabled
                />
              )}
            </div>
          </div>
        </DropDown>
      </div>
    </>
  );
};
