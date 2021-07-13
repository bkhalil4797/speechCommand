import { useState, useRef, useEffect } from "react";
import styles from "../../styles/DopDown.module.css";
import { Button } from "../small/Button";

export const DropDown = () => {
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

  useEffect(() => {
    console.log("render");
  });
  return (
    <>
      <div
        className={`${styles.background} ${!open && styles.displaynone}`}
        id="dropDown"
        ref={container}
        onClick={handleClose}
      ></div>

      <div className={styles.container}>
        <Button state={open} setState={setOpen} text="ClickMe" />

        <div className={`${styles.dropdown} ${!open && styles.displaynone}`}>
          <p>DropDown</p>
        </div>
      </div>
    </>
  );
};
