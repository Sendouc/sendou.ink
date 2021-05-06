import styles from "./Bracket.module.scss";

interface EventTeam {
  seed: number;
  name: string;
  score: number;
}

const Match = ({
  topTeam,
  bottomTeam,
}: {
  topTeam: EventTeam;
  bottomTeam: EventTeam;
}) => {
  return (
    <div
      className={[
        styles.match,
        styles[
          topTeam.score < bottomTeam.score ? "winner-bottom" : "winner-top"
        ],
      ].join(" ")}
    >
      <div className={[styles.team, styles["match-top"]].join(" ")}>
        <span className={styles.image}></span>
        <span className={styles.seed}>{topTeam.seed}</span>
        <span className={styles.name}>{topTeam.name}</span>
        <span className={styles.score}>{topTeam.score}</span>
      </div>
      <div className={[styles.team, styles["match-bottom"]].join(" ")}>
        <span className={styles.image}></span>
        <span className={styles.seed}>{bottomTeam.seed}</span>
        <span className={styles.name}>{bottomTeam.name}</span>
        <span className={styles.score}>{bottomTeam.score}</span>
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
