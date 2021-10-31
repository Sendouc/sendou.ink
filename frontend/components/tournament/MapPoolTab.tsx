import { styled } from "@stitches/react";
import { useTournamentData } from "hooks/data/useTournamentData";
import { stages, modesShort } from "@sendou-ink/shared/constants";
import type { Mode } from "@sendou-ink/api/common";
import { GetTournamentByOrganizationAndName } from "@sendou-ink/api";

export function MapPoolTab() {
  const { data } = useTournamentData();

  // TODO: handle loading
  // TODO: handle error in parent
  if (!data) return null;

  return (
    <S_Container>
      <S_InfoSquare>
        <S_EmphasizedText>{data.mapPool.length} maps</S_EmphasizedText>
      </S_InfoSquare>
      {stages.map((stage) => (
        <S_StageImageContainer key={stage}>
          <S_StageImage
            alt={stage}
            src={`/img/stages/${stage.replaceAll(" ", "-").toLowerCase()}.png`}
            filter={modesPerStage(data.mapPool)[stage] ? undefined : "bw"}
          />
          {modesPerStage(data.mapPool)[stage] && (
            <S_ModeImagesContainer>
              {modesShort.map((mode) => {
                if (!modesPerStage(data.mapPool)[stage]?.includes(mode as Mode))
                  return null;
                return (
                  <S_ModeImage
                    key={mode}
                    src={`/img/modes/${mode}.png`}
                    alt={mode}
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

function modesPerStage(mapPool: GetTournamentByOrganizationAndName["mapPool"]) {
  return mapPool.reduce((acc: Record<string, Mode[]>, { name, mode }) => {
    if (!acc[name]) {
      acc[name] = [];
    }

    acc[name].push(mode);
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
  gridTemplateColumns: "repeat(4, 1fr)",
  gap: "1rem",
});

const S_EmphasizedText = styled("span", {
  fontWeight: "$bold",
});

const S_StageImageContainer = styled("div", {
  position: "relative",
});

const S_StageImage = styled("img", {
  width: "14rem",
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
});

const S_ModeImage = styled("img", {
  width: "2.5rem",
  padding: "$1",
});
