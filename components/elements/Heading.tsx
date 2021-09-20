import { ReactNode } from "react";
import styles from "./Heading.module.css";

type Size = "3xl" | "4xl";

const Heading = ({
  children,
  className = "",
  size = "4xl",
}: {
  children: ReactNode;
  className?: string;
  size?: Size;
}) => {
  return (
    <h2
      style={
        {
          "--heading-size": `var(--fontSizes-${size})`,
        } as any
      }
      className={[styles.heading, className].join(" ")}
    >
      {children}
    </h2>
  );
};

export default Heading;
