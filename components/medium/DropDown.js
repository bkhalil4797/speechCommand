import { useState, useRef, useEffect } from "react";
import styles from "../../styles/DopDown.module.css";
import { Button } from "../small/Button";

export const DropDown = ({ children, open, setOpen }) => {
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
        className={`${styles.background} ${!open && styles.displaynone}`}
        id="dropDown"
        ref={container}
        onClick={handleClose}
      ></div>

      <div className={styles.container}>
        <div className={`${styles.dropdown} ${!open && styles.displaynone}`}>
          {children}
        </div>
      </div>
    </>
  );
};
