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
  backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='20' viewBox='0 0 100 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M21.184 20c.357-.13.72-.264 1.088-.402l1.768-.661C33.64 15.347 39.647 14 50 14c10.271 0 15.362 1.222 24.629 4.928.955.383 1.869.74 2.75 1.072h6.225c-2.51-.73-5.139-1.691-8.233-2.928C65.888 13.278 60.562 12 50 12c-10.626 0-16.855 1.397-26.66 5.063l-1.767.662c-2.475.923-4.66 1.674-6.724 2.275h6.335zm0-20C13.258 2.892 8.077 4 0 4V2c5.744 0 9.951-.574 14.85-2h6.334zM77.38 0C85.239 2.966 90.502 4 100 4V2c-6.842 0-11.386-.542-16.396-2h-6.225zM0 14c8.44 0 13.718-1.21 22.272-4.402l1.768-.661C33.64 5.347 39.647 4 50 4c10.271 0 15.362 1.222 24.629 4.928C84.112 12.722 89.438 14 100 14v-2c-10.271 0-15.362-1.222-24.629-4.928C65.888 3.278 60.562 2 50 2 39.374 2 33.145 3.397 23.34 7.063l-1.767.662C13.223 10.84 8.163 12 0 12v2z' fill='%236741d9' fill-opacity='0.4' fill-rule='evenodd'/%3E%3C/svg%3E")`,
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
