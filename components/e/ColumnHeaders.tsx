import styles from "./Bracket.module.scss";

const ColumnHeaders = () => {
  return (
    <div className={styles["round-infos-container"]}>
      <div className={styles["round-info"]}>
        <div>ROUND 1</div>
        <div className={styles["best-of"]}>Bo3</div>
      </div>
      <div className={styles["round-info"]}>
        <div>SEMI FINALS</div>
        <div className={styles["best-of"]}>Bo3</div>
      </div>
      <div className={styles["round-info"]}>
        <div>GRAND FINALS</div>
        <div className={styles["best-of"]}>Bo5</div>
      </div>
    </div>
  );
};

export default ColumnHeaders;
