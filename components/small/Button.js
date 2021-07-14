import styles from "../../styles/Button.module.css";

export const Button = ({
  text,
  state = null,
  setState = () => {},
  onClick = () => [],
}) => {
  const handleClick = () => {
    setState(!state);
    onClick();
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
