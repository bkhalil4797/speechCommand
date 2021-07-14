import { useState } from "react";
import styles from "../../styles/More.module.css";

export const More = ({ state, setState }) => {
  return (
    <>
      <svg
        viewBox="0 0 24 24"
        className={`${styles.svg} ${state && styles.active}`}
        onClick={() => setState(!state)}
      >
        <circle cx="12" cy="12" r="1"></circle>
        <circle cx="19" cy="12" r="1"></circle>
        <circle cx="5" cy="12" r="1"></circle>
      </svg>
    </>
  );
};
