import { useState } from "react";
import styles from "../../styles/Input.module.css";

export const Input = () => {
  return (
    <>
      <input type="text" className={`${styles.input}`} />
    </>
  );
};
