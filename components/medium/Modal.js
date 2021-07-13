import { useState, useRef, useEffect } from "react";
import styles from "../../styles/Modal.module.css";

export const Modal = ({ children }) => {
  const [open, setOpen] = useState(false);
  const container = useRef();

  const handleClose = (e) => {
    if (
      e.target.id === container.current.id ||
      e.target.className === "close"
    ) {
      setOpen(false);
    }
  };

  return (
    <>
      <button onClick={() => setOpen(!open)}>click me</button>
      {open ? (
        <div
          ref={container}
          onClick={handleClose}
          id="myModal"
          className={styles.container}
        >
          <div className={styles.modal}>
            <p>Some text in the Modal..</p>
          </div>
        </div>
      ) : (
        <></>
      )}
    </>
  );
};
