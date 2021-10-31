import { styled } from "@stitches/react";
import { useTournamentData } from "hooks/data/useTournamentData";

// TODO: shared package
const stageList = [
  "The Reef",
  "Musselforge Fitness",
  "Starfish Mainstage",
  "Humpback Pump Track",
  "Inkblot Art Academy",
  "Sturgeon Shipyard",
  "Moray Towers",
  "Port Mackerel",
  "Manta Maria",
  "Kelp Dome",
  "Snapper Canal",
  "Blackbelly Skatepark",
  "MakoMart",
  "Walleye Warehouse",
  "Shellendorf Institute",
  "Arowana Mall",
  "Goby Arena",
  "Piranha Pit",
  "Camp Triggerfish",
  "Wahoo World",
  "New Albacore Hotel",
  "Ancho-V Games",
  "Skipper Pavilion",
] as const;

const modes = ["TW", "SZ", "TC", "RM", "CB"];

export function MapPoolTab() {
  const { data } = useTournamentData();

  // TODO: handle loading
  // TODO: handle error in parent
  if (!data) return null;

  // TODO: modes from type
  const modesPerStage = data.mapPool.reduce(
    (acc: Record<string, string[]>, { name, mode }) => {
      if (!acc[name]) {
        acc[name] = [];
      }

      acc[name].push(mode);
      return acc;
    },
    {}
  );

  return (
    <S_Container>
      <S_InfoSquare>
        <S_EmphasizedText>{data.mapPool.length} maps</S_EmphasizedText>
      </S_InfoSquare>
      {stageList.map((stage) => (
        <S_StageImageContainer key={stage}>
          <S_StageImage
            alt={stage}
            src={`/img/stages/${stage.replaceAll(" ", "-").toLowerCase()}.png`}
            filter={modesPerStage[stage] ? undefined : "bw"}
          />
          {modesPerStage[stage] && (
            <S_ModeImagesContainer>
              {modes.map((mode) => {
                if (!modesPerStage[stage]?.includes(mode)) return null;
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
