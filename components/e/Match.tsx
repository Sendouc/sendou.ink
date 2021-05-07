import styles from "./Bracket.module.scss";

interface EventTeam {
  seed: number;
  name: string;
  score?: number;
  imageSrc?: string;
}

const Match = ({
  topTeam,
  bottomTeam,
  teamHovered,
  setTeamHovered,
  isConcluded = false,
  isFirstRound = false,
  noAncestors = false,
}: {
  topTeam?: EventTeam;
  bottomTeam?: EventTeam;
  teamHovered?: string;
  setTeamHovered: (val: string | undefined) => void;
  isConcluded?: boolean;
  isFirstRound?: boolean;
  noAncestors?: boolean;
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
        isFirstRound && (!topTeam || !bottomTeam) ? styles.hidden : "",
      ].join(" ")}
    >
      <div
        className={[
          styles.team,
          styles["match-top"],
          typeof topTeam?.score !== "number" ? styles["disable-score"] : "",
          teamHovered === topTeam?.name ? styles.hovered : "",
        ].join(" ")}
        onMouseEnter={() => setTeamHovered(topTeam?.name)}
        onMouseLeave={() => setTeamHovered(undefined)}
      >
        {topTeam ? (
          <>
            {topTeam.imageSrc ? (
              <span className={styles.image}>
                <img
                  style={{ width: "24px", height: "24px", borderRadius: "50%" }}
                  src={topTeam.imageSrc}
                />
              </span>
            ) : null}
            <span className={styles.seed}>{topTeam.seed}</span>
            <span className={styles.name}>{topTeam.name}</span>
            <span className={styles.score}>{topTeam.score}</span>
          </>
        ) : null}
      </div>
      <div
        id={""}
        className={[
          styles.team,
          styles["match-bottom"],
          typeof bottomTeam?.score !== "number" ? styles["disable-score"] : "",
        ].join(" ")}
        onMouseEnter={() => setTeamHovered(bottomTeam?.name)}
        onMouseLeave={() => setTeamHovered(undefined)}
      >
        {bottomTeam ? (
          <>
            {bottomTeam.imageSrc ? (
              <span className={styles.image}>
                <img
                  style={{ width: "24px", height: "24px", borderRadius: "50%" }}
                  src={bottomTeam.imageSrc}
                />
              </span>
            ) : null}
            <span className={styles.seed}>{bottomTeam.seed}</span>
            <span
              className={[
                styles.name,
                teamHovered === bottomTeam?.name ? styles.hovered : "",
              ].join(" ")}
            >
              {bottomTeam.name}
            </span>
            <span className={styles.score}>{bottomTeam.score}</span>
          </>
        ) : null}
      </div>
      <div className={styles["match-lines"]}>
        <div className={[styles.line, styles.one].join(" ")}></div>
        <div className={[styles.line, styles.two].join(" ")}></div>
      </div>
      {noAncestors ? null : (
        <div className={[styles.alt, styles["match-lines"]].join(" ")}>
          <div className={[styles.line, styles.one].join(" ")}></div>
        </div>
      )}
    </div>
  );
};

export default Match;
