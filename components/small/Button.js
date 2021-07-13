import styles from "../../styles/Button.module.css";

export const Button = ({ text, state = null, setState = () => {} }) => {
  const handleClick = () => {
    setState(!state);
  };

  return (
    <>
      <div
        className={`${styles.button} ${state && styles.active} `}
        onClick={handleClick}
      >
        {text}
      </div>
    </>
  );
};
