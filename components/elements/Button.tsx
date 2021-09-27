import classNames from "classnames";
import { ButtonHTMLAttributes, DetailedHTMLProps } from "react";
import styles from "./Button.module.css";

const Button = ({
  isLoading = false,
  ...props
}: DetailedHTMLProps<
  ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
> & {
  isLoading?: boolean;
}) => {
  return (
    <button
      {...props}
      className={classNames(props.className, styles.button, {
        [styles.disabled]: isLoading,
      })}
      disabled={props.disabled || isLoading}
    />
  );
};

export default Button;
