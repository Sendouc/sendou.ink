import { FaDiscord, FaTwitter } from "react-icons/fa";
import { styled } from "stitches.config";
import { useTournamentData } from "../../hooks/data/useTournamentData";

const infos = [
  {
    title: "Starting time",
    value: "Saturday, 18:00",
  },
  {
    title: "Format",
    value: "Double Elimination",
  },
  {
    title: "Organizer",
    value: "Sendou#0043",
  },
];

export function InfoBanner() {
  const { data } = useTournamentData();

  // TODO: handle loading
  // TODO: handle error in parent
  if (!data) return null;

  return (
    <S_Container
      style={
        {
          "--background": data.bannerBackground,
          "--text": `hsl(${data.bannerTextHSLArgs})`,
          "--text-transparent": `hsla(${data.bannerTextHSLArgs}, 0.2)`,
        } as any
      }
    >
      <S_TopRow>
        <S_DateName>
          <S_MonthDate>
            <S_Month>APR</S_Month>
            <S_Date>23</S_Date>
          </S_MonthDate>
          <S_TournamentName>{data.name}</S_TournamentName>
        </S_DateName>
        <S_IconButtons>
          {data.organizer.twitter && (
            <S_IconButton href={data.organizer.twitter}>
              <FaTwitter />
            </S_IconButton>
          )}
          <S_IconButton href={data.organizer.discordInvite}>
            <FaDiscord />
          </S_IconButton>
        </S_IconButtons>
      </S_TopRow>
      <S_BottomRow>
        <S_Infos>
          {infos.map((info) => (
            <S_InfoContainer key={info.title}>
              <S_InfoLabel>{info.title}</S_InfoLabel>
              <div>{info.value}</div>
            </S_InfoContainer>
          ))}
        </S_Infos>
      </S_BottomRow>
    </S_Container>
  );
}

const S_Container = styled("div", {
  width: "min(48rem, 100%)",
  padding: "$6",
  background: "var(--background)",
  borderRadius: "$rounded",
  color: "var(--text)",
});

const S_TopRow = styled("div", {
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "space-between",
  gap: "$4",
});

const S_DateName = styled("div", {
  display: "flex",
  alignItems: "center",
  gap: "$4",
});

const S_MonthDate = styled("div", {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  lineHeight: 1.25,
});

const S_Month = styled("div", {
  fontSize: "$xs",
});

const S_Date = styled("div", {
  fontSize: "$lg",
  fontWeight: "$bold",
});

const S_TournamentName = styled("div", {
  paddingLeft: "$4",
  borderColor: "var(--text)",
  borderLeft: "1px solid",
  fontSize: "$xl",
  fontWeight: "$extraBold",
});

const S_BottomRow = styled("div", {
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  gap: "$4",

  "@sm": {
    flexDirection: "row",
    alignItems: "flex-end",
  },
});

const S_Infos = styled("div", {
  display: "flex",
  flexWrap: "wrap",
  marginTop: "$8",
  gap: "$4",

  "@xs": {
    gap: "$8",
  },
});

const S_IconButtons = styled("div", {
  display: "flex",
  gap: "$4",
});

const S_InfoContainer = styled("div", {
  fontSize: "$xs",
});

const S_InfoLabel = styled("label", {
  fontWeight: "$extraBold",
});

const S_IconButton = styled("a", {
  display: "inline-flex",
  width: "2.25rem",
  height: "2.25rem",
  alignItems: "center",
  justifyContent: "center",
  padding: "0.5rem",
  border: "1px solid",
  borderColor: "var(--text-transparent)",
  borderRadius: "50%",
  color: "inherit",
  transition: "background-color 0.3s",

  "&:active": {
    transform: "translateY(1px)",
  },
});
