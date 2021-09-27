import styles from "./Input.module.css";
import { DetailedHTMLProps, InputHTMLAttributes } from "react";

const Input = (
  props: DetailedHTMLProps<
    InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  >
) => {
  return <input className={styles.input} {...props} />;
};

export default Input;
