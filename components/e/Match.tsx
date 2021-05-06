import styles from "./Bracket.module.scss";

interface EventTeam {
  seed: number;
  name: string;
  score?: number;
}

const Match = ({
  topTeam,
  bottomTeam,
  isConcluded = false,
}: {
  topTeam?: EventTeam;
  bottomTeam?: EventTeam;
  isConcluded?: boolean;
}) => {
  return (
    <div
      className={[
        styles.match,
        styles[
          !isConcluded ||
          typeof topTeam?.score !== "number" ||
          typeof bottomTeam?.score !== "number"
            ? "no-winner"
            : topTeam.score > bottomTeam.score
            ? "winner-top"
            : "winner-bottom"
        ],
      ].join(" ")}
    >
      <div
        className={[
          styles.team,
          styles["match-top"],
          typeof topTeam?.score !== "number" ? styles["disable-score"] : "",
        ].join(" ")}
      >
        {topTeam ? (
          <>
            <span className={styles.image}></span>
            <span className={styles.seed}>{topTeam.seed}</span>
            <span className={styles.name}>{topTeam.name}</span>
            <span className={styles.score}>{topTeam.score}</span>
          </>
        ) : null}
      </div>
      <div
        className={[
          styles.team,
          styles["match-bottom"],
          typeof bottomTeam?.score !== "number" ? styles["disable-score"] : "",
        ].join(" ")}
      >
        {bottomTeam ? (
          <>
            <span className={styles.image}></span>
            <span className={styles.seed}>{bottomTeam.seed}</span>
            <span className={styles.name}>{bottomTeam.name}</span>
            <span className={styles.score}>{bottomTeam.score}</span>
          </>
        ) : null}
      </div>
      <div className={styles["match-lines"]}>
        <div className={[styles.line, styles.one].join(" ")}></div>
        <div className={[styles.line, styles.two].join(" ")}></div>
      </div>
      <div className={[styles.alt, styles["match-lines"]].join(" ")}>
        <div className={[styles.line, styles.one].join(" ")}></div>
      </div>
    </div>
  );
};

export default Match;
