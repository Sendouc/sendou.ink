import { Box, Skeleton } from "@chakra-ui/react";

const event = {
  bg: "yellow",
  logoUrl: "https://abload.de/img/screenshot2021-01-29agyjt6.png",
  staleAfter: "2020-03-08", // always +1 from when the event ends?,
  link: "https://twitter.com/NineWholeGrains/status/1353110481721040897",
  content:
    "Grand Graining Grounds is happening on February 6th and 7th. Starting prize pool of $2500! ",
} as const;

const Banner = () => {
  if (new Date().getTime() > new Date(event.staleAfter).getTime()) return null;

  return (
    <a href={event.link}>
      <Skeleton borderRadius="md" isLoaded={true}>
        <Box
          bg={event.bg}
          color="black"
          p={2}
          mt={4}
          fontWeight="bold"
          textAlign="center"
          borderRadius="md"
        >
          {event.content}
        </Box>
      </Skeleton>
    </a>
  );
};

export default Banner;
