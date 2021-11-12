import { styled } from "stitches.config";

const rounds = [
  {
    title: "Round 1",
    bestOf: 3,
    status: "DONE",
  },
  {
    title: "Round 2",
    bestOf: 5,
    status: "INPROGRESS",
  },
  {
    title: "Semifinals",
    bestOf: 5,
    status: "UPCOMING",
  },
  {
    title: "Finals",
    bestOf: 7,
    status: "UPCOMING",
  },
] as const;

export function BracketTab() {
  return (
    <S_Container style={{ "--columns": rounds.length, "--matches": 4 } as any}>
      <S_Bracket>
        {rounds.map((round, i) => (
          <RoundInfo round={round} isLast={i === rounds.length - 1} />
        ))}
        <S_Column style={{ "--column-matches": 4 } as any}>
          <S_MatchesContainer>
            <Match />
            <Match />
            <Match />
            <Match />
          </S_MatchesContainer>
          <S_LinesContainer>
            <div />
            <div />
          </S_LinesContainer>
        </S_Column>
        <S_Column style={{ "--column-matches": 2 } as any}>
          <S_MatchesContainer>
            <Match />
            <Match />
          </S_MatchesContainer>
          <S_LinesContainer>
            <div />
          </S_LinesContainer>
        </S_Column>
        <S_Column
          style={{ "--column-matches": 0, "--bottom-border-length": 0 } as any}
        >
          <S_MatchesContainer>
            <Match />
          </S_MatchesContainer>
          <S_LinesContainer>
            <div />
          </S_LinesContainer>
        </S_Column>
        <S_MatchesContainer>
          <Match />
        </S_MatchesContainer>
      </S_Bracket>
    </S_Container>
  );
}

const S_Container = styled("div", {
  margin: "0 auto",
  width: "100%",
  display: "flex",
  justifyContent: "center",
});

const S_Bracket = styled("div", {
  display: "grid",
  gridTemplateColumns: "repeat(var(--columns), 250px)",
  columnGap: "2px",
  "--match-height": "100px",
  // todo: fix overflow
  overflowX: "hidden",
});

const S_Column = styled("div", {
  display: "flex",
});

const S_MatchesContainer = styled("div", {
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-around",
  height: "calc(var(--match-height) * var(--matches))",
});

const S_LinesContainer = styled("div", {
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-around",
  paddingLeft: "7px",

  "&> div": {
    width: "calc(var(--match-height) / 4)",
    height:
      "calc(2px + var(--match-height) * (var(--matches) / var(--column-matches)))",
    borderTop: "2px solid",
    borderBottom: "var(--bottom-border-length, 2px) solid",
    borderInlineEnd: "2px solid",
    borderColor: "$theme",
    borderRadius: "0 var(--rounded) var(--rounded) 0",
  },
});

function RoundInfo(props: {
  round: {
    title: string;
    bestOf: number;
    status: "DONE" | "INPROGRESS" | "UPCOMING";
  };
  isLast?: boolean;
}) {
  return (
    <S_RoundInfo
      status={props.round.status === "INPROGRESS" ? "active" : undefined}
      order={props.isLast ? "last" : undefined}
    >
      <S_RoundTitle>{props.round.title}</S_RoundTitle>
      {props.round.status !== "DONE" && (
        <S_BestOf>Bo{props.round.bestOf}</S_BestOf>
      )}
    </S_RoundInfo>
  );
}

const S_RoundInfo = styled("div", {
  backgroundColor: "$bgLighter",
  padding: "1rem 1rem",

  "&:first-of-type": {
    borderRadius: "$rounded 0 0 $rounded",
  },

  variants: {
    status: {
      active: {
        backgroundColor: "$theme",
      },
    },
    order: {
      last: {
        borderRadius: "0 $rounded $rounded 0",
      },
    },
  },
  /* TODO: transition: background-color 0.5s; */
});

const S_RoundTitle = styled("div", {
  fontWeight: 500,
  fontSize: "$sm",
});

const S_BestOf = styled("div", {
  fontSize: "$xs",
});

export function Match() {
  return (
    <S_Match>
      <S_RoundNumber>1</S_RoundNumber>
      <S_Team team="one">
        Team Olive <S_Score>1</S_Score>
      </S_Team>
      <S_Team team="two">
        Chimera <S_Score>1</S_Score>
      </S_Team>
    </S_Match>
  );
}

const S_Match = styled("div", {
  margin: "$4 0",
  display: "grid",
  gridTemplateColumns: "10px 1fr",
  rowGap: "2px",
  columnGap: "5px",
  placeItems: "center",
  gridTemplateAreas: `
    "round-number team-one"
    "round-number team-two"
  `,
});

const S_RoundNumber = styled("div", {
  gridArea: "round-number",
  fontSize: "$xs",
});

const S_Team = styled("div", {
  placeSelf: "flex-start",
  backgroundColor: "$bgLighter",
  width: "200px",
  fontSize: "$sm",
  padding: "$1 $3",
  display: "flex",
  justifyContent: "space-between",

  variants: {
    team: {
      one: {
        gridArea: "team-one",
        borderRadius: "$rounded $rounded 0 0",
      },
      two: {
        gridArea: "team-two",
        borderRadius: "0 0 $rounded $rounded",
      },
    },
  },
});

const S_Score = styled("span", {
  fontWeight: "bold",
});
