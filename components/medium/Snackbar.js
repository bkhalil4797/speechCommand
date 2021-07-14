import { useState, useRef, useEffect, useCallback } from "react";
import styles from "../../styles/Snackbar.module.css";

export const Snackbar = ({ message, type, setState }) => {
  const colors =
    type === "success" ? "#3cb043" : type === "error" ? "#e3242b" : "grey";

  const style = {
    width: "40px",
    height: "40px",
    fill: "none",
    strokeWidth: "2px",
    stroke: "#fff",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    marginRight: "30px",
  };

  const icons =
    type === "success" ? (
      <svg viewBox="0 0 24 24" style={style}>
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
    ) : type === "error" ? (
      <svg viewBox="0 0 24 24" style={style}>
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
        <line x1="12" y1="9" x2="12" y2="13"></line>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
      </svg>
    ) : (
      <svg viewBox="0 0 24 24" style={style}>
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="16" x2="12" y2="12"></line>
        <line x1="12" y1="8" x2="12.01" y2="8"></line>
      </svg>
    );

  useEffect(() => {
    if (message?.length > 0) {
      timer = setTimeout(() => {
        setState({ message: "", type: "" });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, setState]);

  return (
    <>
      {message?.length > 0 && (
        <div
          className={styles.snackbar}
          style={{ backgroundColor: colors }}
          onClick={() => {
            setState({ message: "", type: "" });
          }}
        >
          {icons}
          {message}
        </div>
      )}
    </>
  );
};
