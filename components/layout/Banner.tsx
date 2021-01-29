import { Box, Image } from "@chakra-ui/react";
import MyContainer from "components/common/MyContainer";

const event = {
  bg: "#3F3F3F",
  logoUrl: "https://abload.de/img/screenshot2021-01-29agyjt6.png",
  staleAfter: "2021-02-08", // always +1 from when the event ends?,
  link: "https://twitter.com/NineWholeGrains/status/1353110481721040897",
  content:
    "Grand Graining Grounds is happening on February 6th and 7th. Starting prize pool of $2500!",
} as const;

const Banner = () => {
  if (new Date().getTime() > new Date(event.staleAfter).getTime()) return null;

  return (
    <a href={event.link}>
      <Box
        bg={event.bg}
        color="white"
        p={2}
        fontWeight="bold"
        textAlign="center"
      >
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
