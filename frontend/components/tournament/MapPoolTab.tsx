import { styled } from "stitches.config";
import NextImage from "next/image";
import { useTournamentData } from "hooks/data/useTournamentData";
import { stages, modesShort } from "@sendou-ink/shared/constants";
import type { Mode } from "@sendou-ink/api/common";
import { ModeEnum } from "generated/graphql";

export function MapPoolTab() {
  const { data } = useTournamentData();
  const mapPool =
    data?.tournamentByIdentifier?.mapPoolsByTournamentIdentifier.nodes.map(
      (node) => node.mapModeByMapModeId
    );

  // TODO: handle loading
  // TODO: handle error in parent
  if (!mapPool) return null;

  return (
    <S_Container>
      <S_InfoSquare>
        <S_EmphasizedText>{mapPool.length} maps</S_EmphasizedText>
      </S_InfoSquare>
      {stages.map((stage) => (
        <S_StageImageContainer key={stage}>
          <S_StageImage
            alt={stage}
            src={`/img/stages/${stage.replaceAll(" ", "-").toLowerCase()}.png`}
            filter={modesPerStage(mapPool)[stage] ? undefined : "bw"}
            width={256}
            height={144}
          />
          {modesPerStage(mapPool)[stage] && (
            <S_ModeImagesContainer>
              {modesShort.map((mode) => {
                if (!modesPerStage(mapPool)[stage]?.includes(mode as Mode)) {
                  return null;
                }
                return (
                  <NextImage
                    key={mode}
                    src={`/img/modes/${mode}.png`}
                    alt={mode}
                    width={28}
                    height={28}
                  />
                );
              })}
            </S_ModeImagesContainer>
          )}
        </S_StageImageContainer>
      ))}
    </S_Container>
  );
}

export function modesPerStage(
  mapPool: {
    stage: string;
    gameMode: ModeEnum;
  }[]
) {
  return mapPool.reduce((acc: Record<string, Mode[]>, { stage, gameMode }) => {
    if (!acc[stage]) {
      acc[stage] = [];
    }

    acc[stage].push(gameMode);
    return acc;
  }, {});
}

const S_InfoSquare = styled("div", {
  display: "grid",
  placeItems: "center",
  fontWeight: "$semiBold",
  fontSize: "$xl",
  backgroundImage: `url(/svg/background-pattern.svg)`,
  backgroundColor: "$bgLighter",
  borderRadius: "$rounded",
});

const S_Container = styled("div", {
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gap: "1rem",

  "@xs": {
    gridTemplateColumns: "repeat(2, 1fr)",
  },

  "@sm": {
    gridTemplateColumns: "repeat(4, minmax(1px, 200px))",
  },
});

const S_EmphasizedText = styled("span", {
  fontWeight: "$bold",
});

const S_StageImageContainer = styled("div", {
  position: "relative",
});

const S_StageImage = styled(NextImage, {
  borderRadius: "$rounded",

  variants: {
    filter: {
      bw: {
        filter: "grayscale(100%)",
      },
    },
  },
});

const S_ModeImagesContainer = styled("div", {
  display: "flex",
  position: "absolute",
  backdropFilter: "blur(5px) grayscale(25%)",
  top: 0,
  left: 0,
  borderRadius: "$rounded 0 $rounded 0",
  padding: "$1",
  gap: "$2",
});
