import { Box, Image } from "@chakra-ui/react";
import MyContainer from "components/common/MyContainer";

const event = {
  bg: "#121621",
  logoUrl: "https://abload.de/img/rsz_hxznxtrwdpjke.png",
  staleAfter: "2021-01-10",
  content:
    "Who will be crowned the TASL Season 2 champion - FTWin, FreeZe, Rift or Starburst? Catch the playoffs this Saturday at 12PM ET/6PM CET on EndGameTV!",
} as const;

const Banner = () => {
  if (new Date().getTime() > new Date(event.staleAfter).getTime()) return null;

  return (
    <a href="https://www.twitch.tv/endgametv1">
      <Box bg={event.bg} p={2} fontWeight="bold" textAlign="center">
        <MyContainer>
          <Image
            w={10}
            h={10}
            mb={2}
            mx="auto"
            src={event.logoUrl}
            ignoreFallback
          />
          {event.content}
        </MyContainer>
      </Box>
    </a>
  );
};

export default Banner;
