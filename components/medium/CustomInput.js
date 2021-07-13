import { useState, useRef, useEffect } from "react";
import styles from "../../styles/CustomInput.module.css";
import { Input } from "../small/Input";
import { Mic } from "../small/Mic";
import { More } from "../small/More";
import { SearchIcon } from "../small/SearchIcon";

// In css file the transform: scale(0.9) can mess with the margin

export const CustomInput = () => {
  return (
    <>
      <div className={styles.container}>
        <SearchIcon />
        <Input />
        <Mic />
        <More />
      </div>
    </>
  );
};
