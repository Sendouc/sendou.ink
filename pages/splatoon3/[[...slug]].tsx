import { Box, Flex, Heading, ListItem, UnorderedList } from "@chakra-ui/layout";
import MyHead from "components/common/MyHead";
import MyLink from "components/common/MyLink";
import Video from "components/common/Video";
import type { GetStaticPaths, GetStaticProps } from "next";
import Image from "next/image";
import { capitalizeFirstLetter } from "utils/strings";
import * as z from "zod";

const pages = {
  main: <Main />,
  weapons: <Weapons />,
  specials: <Specials />,
  mechanics: <Mechanics />,
  stages: <Stages />,
};

interface Props {
  page: keyof typeof pages;
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const slug = params?.slug;
  if (!slug) {
    return {
      props: {
        page: "main",
      },
    };
  }

  if (typeof slug === "string") {
    return {
      notFound: true,
    };
  }

  const parsed = z
    .enum(["weapons", "specials", "mechanics", "stages"])
    .safeParse(slug[0]);

  if (parsed.success) {
    return {
      props: {
        page: parsed.data,
      },
    };
  }

  return {
    notFound: true,
  };
};

const Splatoon3Page = ({ page }: Props) => {
  return (
    <>
      <MyHead
        title={`Splatoon 3 ${
          page === "main" ? "" : capitalizeFirstLetter(page)
        }`}
      />
      <Box display="flex" alignItems="center" justifyContent="center">
        <Image
          src="/splatoon3/logo.png"
          width={638}
          height={319}
          alt="Splatoon 3 logo"
        />
      </Box>
      <Flex flexWrap="wrap" justifyContent="center" maxW="48rem" mx="auto">
        <Box
          rounded="lg"
          bgColor="pink.500"
          padding={2}
          color="black"
          fontWeight="bold"
          fontSize="sm"
          margin={4}
          flex="1 1 0px"
          textAlign="center"
        >
          <MyLink href="/splatoon3" isColored={false}>
            Info
          </MyLink>
        </Box>
        <Box
          rounded="lg"
          bgColor="red.500"
          padding={2}
          color="black"
          fontWeight="bold"
          fontSize="sm"
          margin={4}
          flex="1 1 0px"
          textAlign="center"
        >
          <MyLink href="/splatoon3/weapons" isColored={false}>
            Weapons
          </MyLink>
        </Box>

        <Box
          rounded="lg"
          bgColor="purple.500"
          padding={2}
          color="black"
          fontWeight="bold"
          fontSize="sm"
          margin={4}
          flex="1 1 0px"
          textAlign="center"
        >
          <MyLink href="/splatoon3/specials" isColored={false}>
            Specials
          </MyLink>
        </Box>
        <Box
          rounded="lg"
          bgColor="yellow.500"
          padding={2}
          color="black"
          fontWeight="bold"
          fontSize="sm"
          margin={4}
          flex="1 1 0px"
          textAlign="center"
        >
          <MyLink href="/splatoon3/mechanics" isColored={false}>
            Mechanics
          </MyLink>
        </Box>
        <Box
          rounded="lg"
          bgColor="green.500"
          padding={2}
          color="black"
          fontWeight="bold"
          fontSize="sm"
          margin={4}
          flex="1 1 0px"
          textAlign="center"
        >
          <MyLink href="/splatoon3/stages" isColored={false}>
            Stages
          </MyLink>
        </Box>
      </Flex>
      {pages[page]}
    </>
  );
};

function Main() {
  return (
    <>
      <Box as="p" my={8}>
        <MyLink
          isExternal
          href="https://www.nintendo.com/games/detail/splatoon-3-switch/"
        >
          Splatoon 3
        </MyLink>{" "}
        will be released for Nintendo Switch in 2022. It is planned that support
        for the game will be added to sendou.ink but in the meanwhile you can
        use this page to explore what we know about it. The focus is on the
        parts of the game that affect the multiplayer.
        <br />
        <br />
        There is still so much we don't know about the game but this page will
        update as we learn more. In terms of missing pages that will be added
        later "Sub weapons" is missing since have only seen a glimpse of Splat
        Bomb. "Modes" is missing since we have only seen Turf War so far.
      </Box>
      <Heading size="lg" as="h3" mt={4}>
        Timeline
      </Heading>
      <UnorderedList listStyleType="none" ml="0">
        <ListItem my={2}>
          <Box as="span" fontSize="sm" fontWeight="bold" mr="2">
            February 18, 2021
          </Box>
          Splatoon 3 is revealed in Nintendo Direct and{" "}
          <MyLink isExternal href="https://www.youtube.com/watch?v=GUYDXVDLmns">
            first trailer
          </MyLink>{" "}
          is shown
        </ListItem>
        <ListItem my={2}>
          <Box as="span" fontSize="sm" fontWeight="bold" mr="2">
            July 17, 2019
          </Box>
          <MyLink
            isExternal
            href="https://japanesenintendo.wordpress.com/2019/07/17/splatoon-producer-says-splatoon-3-development-hasnt-started-yet/"
          >
            Splatoon 3 producer says Splatoon 3 development hasn't started yet
          </MyLink>
        </ListItem>
      </UnorderedList>
    </>
  );
}

function Mechanics() {
  return (
    <>
      <Heading size="lg" as="h3" mt={4}>
        Spawning
      </Heading>
      <Box as="p" my={4} mb={6}>
        Spawning into a match is redesigned. At the start of the match players
        can launch to the stage from a spawner drone in the sky. Landing spot is
        freely selectable within the range. You can also see where your mates
        are aiming to land. It's currently unclear how exactly respawning will
        work but it seems likely it will use similar mechanic. In the first
        trailer the old type of respawn pad can be seen covered up that could be
        hinting towards that. Maybe the point where you launch from could also
        change under some circumstances mimicking the common shooter mechanic of
        varying spawns to make spawn camping harder.
      </Box>
      <Video clipName="trailer1" time={{ start: 4, end: 11 }} />
      <Heading size="lg" as="h3" mt={6}>
        Squid roll
      </Heading>
      <Box as="p" my={4} mb={6}>
        Change to the opposite direction quickly with a leap when swimming. You
        can also shoot during this leap. Maybe similar utility as sub strafing
        in the previous games?
      </Box>
      <Video clipName="trailer1" time={{ start: 13.7, end: 14.3 }} />
      <Heading size="lg" as="h3" mt={6}>
        Squid surge
      </Heading>
      <Box as="p" my={4} mb={6}>
        When climbing up the ledge you now have an option to do a high jump with
        a height similar to Splashdown. Unlike Splashdown you are able to use
        your main weapon in the middle of this jump. Potentially makes ledges
        more dangerous for the players above them.
      </Box>
      <Video clipName="trailer1" time={{ start: 14.8, end: 17 }} />
      <Heading size="lg" as="h3" mt={6}>
        Jumping height
      </Heading>
      <Box as="p" my={4} mb={6}>
        In the first trailer players can be seen{" "}
        <MyLink isExternal href="https://youtu.be/zWR8uL-6fd0?t=240">
          jumping higher
        </MyLink>{" "}
        than what was possible before.
      </Box>
    </>
  );
}

function Stages() {
  return (
    <>
      <Heading size="lg" as="h3" mt={4}>
        Unnamed desert stage
      </Heading>
      <Box as="p" my={4} mb={6}>
        First stage shown that seems to be quite open with big snipe perches.
        Middle of the map consists of grates and a tall but narrow pillar.
      </Box>
      <Box mb={4}>
        <Image src="/splatoon3/stage1.jpeg" width={852} height={480} />
      </Box>
      <Video
        clipName="trailer1"
        time={{ start: 15, end: 18 }}
        playbackRate={0.25}
      />
    </>
  );
}

function Weapons() {
  return (
    <>
      <Heading size="lg" as="h3" mt={4}>
        Unnamed Bow weapon
      </Heading>
      <Box as="p" my={4} mb={6}>
        New weapon class. Shoots 3 arrows at once. Closes comparison seems to be
        with the Charger class.
      </Box>
      <Box my={4}>
        <Image src="/splatoon3/bow.jpeg" width={852} height={480} />
      </Box>
      <Heading size="lg" as="h3" mt={6}>
        Splattershot
      </Heading>
      <Box my={4}>
        <Image src="/splatoon3/splattershot.jpeg" width={852} height={480} />
      </Box>
      <Heading size="lg" as="h3" mt={6}>
        Sloshing Machine
      </Heading>
      <Box my={4}>
        <Image src="/splatoon3/machine.jpeg" width={852} height={480} />
      </Box>
      <Heading size="lg" as="h3" mt={6}>
        .96 Gal
      </Heading>
      <Box as="p" my={4} mb={6}>
        .96 Gal has a different design to make it distinct from .52 Gal.
      </Box>
      <Box my={4}>
        <Image src="/splatoon3/96.jpg" width={852} height={480} />
      </Box>
      <Heading size="lg" as="h3" mt={6}>
        Blaster & Range Blaster
      </Heading>
      <Box as="p" my={4} mb={6}>
        Range Blaster has been completely redesigned so it's easier to tell it
        apart from normal Blaster.
      </Box>
      <Box my={4}>
        <Image src="/splatoon3/blasters.jpeg" width={852} height={480} />
      </Box>
      <Heading size="lg" as="h3" mt={6}>
        Dynamo Roller
      </Heading>
      <Box my={4}>
        <Image src="/splatoon3/dynamo.jpeg" width={852} height={480} />
      </Box>
      <Heading size="lg" as="h3" mt={6}>
        E-liter
      </Heading>
      <Box my={4}>
        <Image src="/splatoon3/eliter.png" width={852} height={480} />
      </Box>
      <Heading size="lg" as="h3" mt={6}>
        Hydra Splatling
      </Heading>
      <Box my={4}>
        <Image src="/splatoon3/hydra.png" width={852} height={480} />
      </Box>
    </>
  );
}

function Specials() {
  return (
    <>
      <Heading size="lg" as="h3" mt={6}>
        Inkzooka
      </Heading>
      <Box as="p" my={4} mb={6}>
        Shoots a group of 3 balls now instead of tornados like in Splatoon 1.
        Usage seems to be limited to a certain number instead of allowing you to
        spam it like in Splatoon 1.
      </Box>
      <Box my={4}>
        <Image src="/splatoon3/inkzooka.jpeg" width={852} height={480} />
      </Box>
      <Heading size="lg" as="h3" mt={4}>
        Unnamed Robo-Crab special
      </Heading>
      <Box as="p" my={4} mb={6}>
        Shown balling up in the first trailer. Some kind of turret?
      </Box>
      <Box my={4}>
        <Image src="/splatoon3/crab.jpeg" width={852} height={480} />
      </Box>
      <Heading size="lg" as="h3" mt={4}>
        Unnamed beam special
      </Heading>
      <Box as="p" my={4} mb={6}>
        The beams go through walls like Stingray.
      </Box>
      <Box my={4}>
        <Image src="/splatoon3/beams.jpeg" width={852} height={480} />
      </Box>
      <Heading size="lg" as="h3" mt={4}>
        Tenta Missiles -like special
      </Heading>
      <Box as="p" my={4} mb={6}>
        Special only shown on screenshots. Could be Tenta Missiles or something
        similar to it.
      </Box>
      <Box my={4}>
        <Image src="/splatoon3/missiles.png" width={400} height={200} />
      </Box>
    </>
  );
}

export default Splatoon3Page;
