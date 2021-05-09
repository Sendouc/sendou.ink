import styles from "./Bracket.module.scss";

const topBracketSecondLastRoundName = {
  WINNERS: "WINNERS SEMIS",
  LOSERS: "LOSERS SEMIS",
  SE: "SEMIFINALS",
};

const topBracketLastRoundName = {
  WINNERS: "WINNERS FINALS",
  LOSERS: "LOSERS FINALS",
  SE: "FINALS",
};

const ColumnHeaders = ({
  roundsCount,
  bracket,
}: {
  roundsCount: number;
  bracket: "WINNERS" | "LOSERS" | "SE";
}) => {
  const roundLabels = () => {
    return new Array(roundsCount).fill(null).map((_, i) => {
      const roundNumber = i + 1;

      if (roundNumber === roundsCount - 1)
        return topBracketSecondLastRoundName[bracket];
      if (roundNumber === roundsCount) return topBracketLastRoundName[bracket];

      return `ROUND ${roundNumber}`;
    });
  };

  return (
    <div className={styles["round-infos-container"]}>
      {roundLabels().map((label) => {
        return (
          <div key={label} className={styles["round-info"]}>
            <div>{label}</div>
            <div className={styles["best-of"]}>Bo3</div>
          </div>
        );
      })}
    </div>
  );
};

export default ColumnHeaders;
