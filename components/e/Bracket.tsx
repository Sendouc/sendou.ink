import styles from "./Bracket.module.scss";

const Bracket = () => {
  return (
    <div className={[styles.theme, styles["theme-dark-trendy"]].join(" ")}>
      <div className={[styles.bracket, styles["disable-image"]].join(" ")}>
        <div className={styles.column}>
          <div className={[styles.match, styles["winner-top"]].join(" ")}>
            <div className={[styles.team, styles["match-top"]].join(" ")}>
              <span className={styles.image}></span>
              <span className={styles.seed}>1</span>
              <span className={styles.name}>NSTC</span>
              <span className={styles.score}>2</span>
            </div>
            <div className={[styles.team, styles["match-bottom"]].join(" ")}>
              <span className={styles.image}></span>
              <span className={styles.seed}>8</span>
              <span className={styles.name}>Radiance</span>
              <span className={styles.score}>1</span>
            </div>
            <div className={styles["match-lines"]}>
              <div className={[styles.line, styles.one].join(" ")}></div>
              <div className={[styles.line, styles.two].join(" ")}></div>
            </div>
            <div className={[styles.alt, styles["match-lines"]].join(" ")}>
              <div className={[styles.line, styles.one].join(" ")}></div>
            </div>
          </div>

          <div className={[styles.match, styles["winner-bottom"]].join(" ")}>
            <div className={[styles.team, styles["match-top"]].join(" ")}>
              <span className={styles.image}></span>
              <span className={styles.seed}>4</span>
              <span className={styles.name}>FTWin!</span>
              <span className={styles.score}>1</span>
            </div>
            <div className={[styles.team, styles["match-bottom"]].join(" ")}>
              <span className={styles.image}></span>
              <span className={styles.seed}>5</span>
              <span className={styles.name}>Team Olive</span>
              <span className={styles.score}>2</span>
            </div>
            <div className={styles["match-lines"]}>
              <div className={[styles.line, styles.one].join(" ")}></div>
              <div className={[styles.line, styles.two].join(" ")}></div>
            </div>
            <div className={[styles.alt, styles["match-lines"]].join(" ")}>
              <div className={[styles.line, styles.one].join(" ")}></div>
            </div>
          </div>

          <div className={[styles.match, styles["winner-top"]].join(" ")}>
            <div className={[styles.team, styles["match-top"]].join(" ")}>
              <span className={styles.image}></span>
              <span className={styles.seed}>2</span>
              <span className={styles.name}>FreeZe</span>
              <span className={styles.score}>2</span>
            </div>
            <div className={[styles.team, styles["match-bottom"]].join(" ")}>
              <span className={styles.image}></span>
              <span className={styles.seed}>7</span>
              <span className={styles.name}>Kraken Paradise</span>
              <span className={styles.score}>0</span>
            </div>
            <div className={styles["match-lines"]}>
              <div className={[styles.line, styles.one].join(" ")}></div>
              <div className={[styles.line, styles.two].join(" ")}></div>
            </div>
            <div className={[styles.alt, styles["match-lines"]].join(" ")}>
              <div className={[styles.line, styles.one].join(" ")}></div>
            </div>
          </div>

          <div className={[styles.match, styles["winner-top"]].join(" ")}>
            <div className={[styles.team, styles["match-top"]].join(" ")}>
              <span className={styles.image}></span>
              <span className={styles.seed}>3</span>
              <span className={styles.name}>JFG</span>
              <span className={styles.score}>2</span>
            </div>
            <div className={[styles.team, styles["match-bottom"]].join(" ")}>
              <span className={styles.image}></span>
              <span className={styles.seed}>6</span>
              <span className={styles.name}>Chimera</span>
              <span className={styles.score}>1</span>
            </div>
            <div className={styles["match-lines"]}>
              <div className={[styles.line, styles.one].join(" ")}></div>
              <div className={[styles.line, styles.two].join(" ")}></div>
            </div>
            <div className={[styles.alt, styles["match-lines"]].join(" ")}>
              <div className={[styles.line, styles.one].join(" ")}></div>
            </div>
          </div>
        </div>

        <div className={styles.column}>
          <div className={[styles.match, styles["winner-bottom"]].join(" ")}>
            <div className={[styles.team, styles["match-top"]].join(" ")}>
              <span className={styles.image}></span>
              <span className={styles.seed}>1</span>
              <span className={styles.name}>NSTC</span>
              <span className={styles.score}>1</span>
            </div>
            <div className={[styles.team, styles["match-bottom"]].join(" ")}>
              <span className={styles.image}></span>
              <span className={styles.seed}>5</span>
              <span className={styles.name}>Team Olive</span>
              <span className={styles.score}>2</span>
            </div>
            <div className={styles["match-lines"]}>
              <div className={[styles.line, styles.one].join(" ")}></div>
              <div className={[styles.line, styles.two].join(" ")}></div>
            </div>
            <div className={[styles.alt, styles["match-lines"]].join(" ")}>
              <div className={[styles.line, styles.one].join(" ")}></div>
            </div>
          </div>

          <div className={[styles.match, styles["winner-bottom"]].join(" ")}>
            <div className={[styles.team, styles["match-top"]].join(" ")}>
              <span className={styles.image}></span>
              <span className={styles.seed}>2</span>
              <span className={styles.name}>FreeZe</span>
              <span className={styles.score}>1</span>
            </div>
            <div className={[styles.team, styles["match-bottom"]].join(" ")}>
              <span className={styles.image}></span>
              <span className={styles.seed}>3</span>
              <span className={styles.name}>JFG</span>
              <span className={styles.score}>2</span>
            </div>
            <div className={styles["match-lines"]}>
              <div className={[styles.line, styles.one].join(" ")}></div>
              <div className={[styles.line, styles.two].join(" ")}></div>
            </div>
            <div className={[styles.alt, styles["match-lines"]].join(" ")}>
              <div className={[styles.line, styles.one].join(" ")}></div>
            </div>
          </div>
        </div>

        <div className={styles.column}>
          <div className={[styles.match, styles["winner-top"]].join(" ")}>
            <div className={[styles.team, styles["match-top"]].join(" ")}>
              <span className={styles.image}></span>
              <span className={styles.seed}>5</span>
              <span className={styles.name}>Team Olive</span>
              <span className={styles.score}>3</span>
            </div>
            <div className={[styles.team, styles["match-bottom"]].join(" ")}>
              <span className={styles.image}></span>
              <span className={styles.seed}>3</span>
              <span className={styles.name}>JFG</span>
              <span className={styles.score}>2</span>
            </div>
            <div className={styles["match-lines"]}>
              <div className={[styles.line, styles.one].join(" ")}></div>
              <div className={[styles.line, styles.two].join(" ")}></div>
            </div>
            <div className={[styles.alt, styles["match-lines"]].join(" ")}>
              <div className={[styles.line, styles.one].join(" ")}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Bracket;
