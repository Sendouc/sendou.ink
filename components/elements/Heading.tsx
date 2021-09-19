import { ReactNode } from "react";
import styles from "./Heading.module.css";

const Heading = ({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) => {
  return <h2 className={[styles.heading, className].join(" ")}>{children}</h2>;
};

export default Heading;
