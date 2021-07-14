import { useState, useEffect } from "react";
import { Modal } from "../medium/Modal";
import { useContextProvider } from "../../context";
// eslint-disable-next-line no-unused-vars
import * as tf from "@tensorflow/tfjs";
import * as SpeechCommands from "@tensorflow-models/speech-commands";
import localforage from "localforage";

const epochs = 50;

export const ModifyModel = () => {
  const [addWord, setAddWord] = useState("");
  const [words, setWords] = useState([]);
  const [savedWords, setSavedWords] = useState([]);
  const [modify, setModify] = useState(false);
  const [countExamples, setCountExamples] = useState({});
  const [currentRecognizer, setCurrentRecognizer] = useState();

  const {
    openModal,
    setOpenModal,
    selectedModel,
    setSelectedModel,
    cachedModel,
    setCachedModel,
    recognizer,
    savedModel,
    setSavedModel,
    setAlert,
  } = useContextProvider();

  const initialLoad = async () => {
    const alreadyLoaded = cachedModel.filter(
      (model) => model.name === selectedModel
    );
    if (alreadyLoaded.length > 0) {
      setCurrentRecognizer(alreadyLoaded[0].model);
      console.log("Model loaded from cache");
      const transfWord = await alreadyLoaded[0].model.wordLabels();
      // In case where we CREATE (it mean it is not saved)
      // a model for the second time with the same name
      // in case the model doesn't have any word
      if (transfWord !== null) {
        setWords(transfWord);
        try {
          setCountExamples(await alreadyLoaded[0].model.countExamples());
        } catch (err) {
          console.log("initial load cout exemple error 'nothing to worry'");
        }
      }
    } else if (savedModel.includes(selectedModel)) {
      const transfRec = recognizer.createTransfer(selectedModel);
      await transfRec.load();
      setCurrentRecognizer(transfRec);
      setCachedModel([
        ...cachedModel,
        { name: selectedModel, model: transfRec },
      ]);
      console.log("Model loaded from indexeddb");
      const transfWord = await transfRec.wordLabels();
      setWords(transfWord);
    } else {
      const transfRec = recognizer.createTransfer(selectedModel);
      setCurrentRecognizer(transfRec);
      setCachedModel([
        ...cachedModel,
        { name: selectedModel, model: transfRec },
      ]);
      setAlert({
        message: `Le modele ${selectedModel
          .substring(0, 1)
          .toUpperCase()}${selectedModel.substring(
          1,
          selectedModel.length - 5
        )} a été créer`,
        type: "success",
      });
      console.log("Model created");
    }
    const savedWord = await localforage.keys();
    setSavedWords(savedWord);
    if (!savedModel.includes(selectedModel)) {
      setModify(true);
    }
  };

  useEffect(() => {
    initialLoad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAdd = async () => {
    if (!modify) {
      return;
    }
    if (addWord.length === 0) {
      setAlert({
        message: "Le mot doit en moins contenir une lettre",
        type: "error",
      });
      return;
    }
    if (words.includes(addWord.toLowerCase())) {
      setAlert({
        message: "Le mot est existant",
        type: "",
      });
      setAddWord("");
      return;
    }
    if (savedWords.includes(addWord.toLowerCase())) {
      await localforage.getItem(addWord.toLowerCase(), (err, value) => {
        if (err) {
          console.log(err);
        }
        currentRecognizer.loadExamples(value, false);
      });
      setSavedWords(
        savedWords.filter((saved) => saved !== addWord.toLowerCase())
      );
      setWords([...words, addWord.toLowerCase()]);
      setCountExamples(await currentRecognizer.countExamples());
      setAddWord("");
      return;
    }

    setWords([...words, addWord.toLowerCase()]);
    setAddWord("");
  };

  const handleModify = async () => {
    if (modify) {
      return;
    }
    setModify(!modify);
    let version = Number(
      selectedModel.substring(selectedModel.length - 3, selectedModel.length)
    );
    version = version + 1;
    version = String(version);
    for (let i = version.length; i < 3; i++) {
      version = "0" + version;
    }
    const newModelName = `${selectedModel.substring(
      0,
      selectedModel.length - 5
    )} v${version}`;
    setSelectedModel(newModelName);

    // the real deal to create a new transfert
    try {
      const alreadyLoaded = cachedModel.filter(
        (model) => model.name === newModelName
      );
      let transfRec;
      if (alreadyLoaded.length > 0) {
        transfRec = alreadyLoaded[0].model;
        setCurrentRecognizer(alreadyLoaded[0].model);
        await transfRec.clearExamples();
        console.log("Model loaded from cache");
      } else {
        transfRec = recognizer.createTransfer(newModelName);
        setCurrentRecognizer(transfRec);
        setCachedModel([
          ...cachedModel,
          { name: newModelName, model: transfRec },
        ]);
      }
      const transfWord = await currentRecognizer.wordLabels();
      setWords(transfWord);
      // this variable is here because state are asynchronous
      // so we can't use savedWords
      let savedWord = savedWords;
      for (let word of transfWord) {
        savedWord = savedWord.filter((saved) => saved !== word);
        await localforage.getItem(word, (err, value) => {
          if (err) {
            console.log(err);
          }
          transfRec.loadExamples(value, false);
        });
      }
      setSavedWords(savedWord);
      setCountExamples(await transfRec.countExamples());
    } catch (err) {
      console.log(err);
      console.log("modify error");
    }
  };

  const handleCancel = () => {
    setOpenModal(false);
  };

  const handleDelete = async () => {
    if (!modify) {
      return;
    }
    let version = Number(
      selectedModel.substring(selectedModel.length - 3, selectedModel.length)
    );
    version = version - 1;
    version = String(version);
    for (let i = version.length; i < 3; i++) {
      version = "0" + version;
    }
    const oldModelName = `${selectedModel.substring(
      0,
      selectedModel.length - 5
    )} v${version}`;
    if (savedModel.includes(oldModelName)) {
      try {
        await SpeechCommands.deleteSavedTransferModel(oldModelName);
        setOpenModal(false);
        setSavedModel(savedModel.filter((model) => model !== oldModelName));
      } catch (err) {
        console.log(err);
        console.log("Delete model error");
      }
    }
    if (savedModel.includes(selectedModel)) {
      try {
        await SpeechCommands.deleteSavedTransferModel(selectedModel);
        setOpenModal(false);
        setSavedModel(savedModel.filter((model) => model !== selectedModel));
      } catch (err) {
        console.log(err);
        console.log("Delete model error");
      }
    }
  };

  const handleSave = async () => {
    if (!modify) {
      return;
    }
    try {
      await currentRecognizer.train({
        epochs,
        callback: {
          onEpochEnd: async (epoch, logs) => {
            console.log(
              `Epoch ${epoch}: loss=${logs.loss}, accuracy=${logs.acc}`
            );
          },
        },
      });
      await currentRecognizer.save();
      console.log(`saved ${selectedModel}`);
      let realWods = [];
      for (let word in countExamples) {
        realWods = [...realWods, word];
      }
      setWords(realWods);
      for (let word of realWods) {
        const serialized = currentRecognizer.serializeExamples(word);
        localforage.setItem(word, serialized).then(console.log(`${word} done`));
      }
    } catch (err) {
      setAlert({
        message:
          "Vous devais en moins avoir 2 mot avec des exemples par modele",
        type: "error",
      });
      console.log(err);
      return;
    }
    let version = Number(
      selectedModel.substring(selectedModel.length - 3, selectedModel.length)
    );
    if (version === 1) {
      // do nothing
    } else {
      version = version - 1;
      version = String(version);
      for (let i = version.length; i < 3; i++) {
        version = "0" + version;
      }
      const oldModelName = `${selectedModel.substring(
        0,
        selectedModel.length - 5
      )} v${version}`;
      if (savedModel.includes(oldModelName)) {
        try {
          await SpeechCommands.deleteSavedTransferModel(oldModelName);
          console.log(`delete ${oldModelName}`);
        } catch (err) {
          console.log(err);
          console.log("Delete model error");
        }
      }
    }
    const savedModelKeys = await SpeechCommands.listSavedTransferModels();
    setSavedModel(savedModelKeys);
  };

  const handleTransfertWord = async (savedWord) => {
    if (!modify) {
      return;
    }
    await localforage.getItem(savedWord, (err, value) => {
      if (err) {
        console.log(err);
      }
      currentRecognizer.loadExamples(value, false);
    });
    setSavedWords(savedWords.filter((word) => word !== savedWord));
    setWords([...words, savedWord]);
    setCountExamples(await currentRecognizer.countExamples());
  };

  const handleDeleteWord = async (selectedWord) => {
    if (!modify) {
      return;
    }
    try {
      const exemples = currentRecognizer.getExamples(selectedWord);
      for (let index in exemples) {
        await currentRecognizer.removeExample(exemples[index].uid);
      }
    } catch (err) {
      setAlert({ message: "something happened", type: "error" });
      console.log(err);
    }
    setWords(words.filter((word) => word !== selectedWord));
    setSavedWords([...savedWords, selectedWord]);
  };

  const handleAddWord = async (selectedWord) => {
    if (!modify) {
      return;
    }
    try {
      await currentRecognizer.collectExample(selectedWord);
      setCountExamples(await currentRecognizer.countExamples());
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      <Modal open={openModal} setOpen={setOpenModal}>
        <div>
          <h1>
            Modele :
            {`${selectedModel
              .substring(0, 1)
              .toUpperCase()}${selectedModel.substring(
              1,
              selectedModel.length - 5
            )}`}{" "}
            {modify ? (
              <svg
                viewBox="0 0 24 24"
                className={`svg`}
                style={{ width: "24px", height: "24px" }}
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 9.9-1"></path>
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                className={`svg`}
                style={{ width: "24px", height: "24px" }}
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            )}
          </h1>
          <p>Version : {selectedModel}</p>
        </div>

        <div className="modifymodel__main">
          <div>
            {modify ? (
              <input
                type="text"
                placeholder="Ajouter un mot"
                value={addWord}
                onChange={(e) => setAddWord(e.target.value)}
              />
            ) : (
              <input
                type="text"
                placeholder="Ajouter un mot"
                value={addWord}
                onChange={(e) => setAddWord(e.target.value)}
                disabled
                style={{ opacity: "0.6" }}
              />
            )}
            <button className={`btn ${modify && "mbtn"}`} onClick={handleAdd}>
              <svg viewBox="0 0 24 24" className={`svg`}>
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="16"></line>
                <line x1="8" y1="12" x2="16" y2="12"></line>
              </svg>
              Ajouter
            </button>
          </div>
          <div className="modifymodel__words">
            <div>
              <p>Mot du modele</p>
              {words.length > 0 ? (
                words.map((word) => (
                  <div key={word}>
                    <button
                      className={`btn ${modify && "mbtn"}`}
                      style={{ minWidth: "150px" }}
                      onClick={() => handleAddWord(word)}
                    >
                      {word} ({countExamples[word] ? countExamples[word] : 0})
                    </button>
                    <button
                      className={`btn ${modify && "mbtn"}`}
                      style={{ borderRadius: "50%" }}
                      onClick={() => handleDeleteWord(word)}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className={`svg`}
                        style={{ margin: 0 }}
                      >
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>
                ))
              ) : (
                <p>Aucun mot existant</p>
              )}
            </div>
            {modify && (
              <div>
                <p>Ajouter un mot déja utilisé</p>
                {savedWords.length > 0 ? (
                  savedWords.map((word) => (
                    <div key={word}>
                      <button
                        className={`btn ${modify && "mbtn"}`}
                        style={{ minWidth: "150px" }}
                        onClick={() => handleTransfertWord(word)}
                      >
                        {word}
                      </button>
                    </div>
                  ))
                ) : (
                  <p>Aucun mot enregistrer</p>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="modifymodel__footer">
          <button className={`btn ${!modify && "mbtn"}`} onClick={handleModify}>
            <svg viewBox="0 0 24 24" className={`svg`}>
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            Modifier
          </button>
          <button className={`btn ${modify && "mbtn"}`} onClick={handleDelete}>
            <svg viewBox="0 0 24 24" className={`svg`}>
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
            Supprimer
          </button>
          <button className={`btn ${modify && "mbtn"}`} onClick={handleSave}>
            <svg viewBox="0 0 24 24" className={`svg`}>
              <path d="M4 3h16a2 2 0 0 1 2 2v6a10 10 0 0 1-10 10A10 10 0 0 1 2 11V5a2 2 0 0 1 2-2z"></path>
              <polyline points="8 10 12 14 16 10"></polyline>
            </svg>
            Enregistrer
          </button>
          <button className={`btn mbtn`} onClick={handleCancel}>
            <svg viewBox="0 0 24 24" className={`svg`}>
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="9" y1="9" x2="15" y2="15"></line>
              <line x1="15" y1="9" x2="9" y2="15"></line>
            </svg>
            Fermer
          </button>
        </div>
      </Modal>
    </>
  );
};
