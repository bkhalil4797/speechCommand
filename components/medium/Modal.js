import { useState, useRef, useEffect } from "react";
import styles from "../../styles/Modal.module.css";

export const Modal = ({ children, open, setOpen }) => {
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
      <div
        ref={container}
        onClick={handleClose}
        id="myModal"
        className={styles.container}
      >
        <div className={styles.modal}>{children}</div>
      </div>
    </>
  );
};
