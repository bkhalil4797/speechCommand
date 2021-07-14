import { useState } from "react";
import styles from "../../styles/Input.module.css";

export const Input = ({ inputRef, placeholder = "", style = {} }) => {
  return (
    <>
      <input
        ref={inputRef}
        type="text"
        className={`${styles.input}`}
        placeholder={placeholder}
        autoComplete="off"
        style={style}
      />
    </>
  );
};
