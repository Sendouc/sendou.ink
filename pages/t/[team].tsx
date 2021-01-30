import {
  Box,
  Button,
  Center,
  Divider,
  Flex,
  Heading,
  IconButton,
  Popover,
  PopoverArrow,
  PopoverContent,
  PopoverTrigger,
  Stack,
  useToast,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import { t, Trans } from "@lingui/macro";
import Markdown from "components/common/Markdown";
import MyContainer from "components/common/MyContainer";
import MyLink from "components/common/MyLink";
import Section from "components/common/Section";
import SubText from "components/common/SubText";
import SubTextCollapse from "components/common/SubTextCollapse";
import TwitterAvatar from "components/common/TwitterAvatar";
import UserAvatar from "components/common/UserAvatar";
import WeaponImage from "components/common/WeaponImage";
import TeamManagementModal from "components/t/TeamManagementModal";
import TeamProfileModal from "components/t/TeamProfileModal";
import { countries, getEmojiFlag } from "countries-list";
import useUser, { useMyTheme } from "hooks/common";
import { getToastOptions } from "lib/getToastOptions";
import { sendData } from "lib/postData";
import { GetStaticPaths, GetStaticProps } from "next";
import Image from "next/image";
import { getTeam, GetTeamData } from "prisma/queries/getTeam";
import { Fragment, useEffect, useState } from "react";
import { FaTwitter } from "react-icons/fa";
import { FiEdit } from "react-icons/fi";
import useSWR, { mutate } from "swr";

interface Props {
  team: GetTeamData;
}

const getTeamXPInfo = (roster: NonNullable<GetTeamData>["roster"]) => {
  const placements = roster.reduce(
    (
      acc: {
        weapon: string;
        month: number;
        year: number;
        mode: "SZ" | "TC" | "RM" | "CB";
        xPower: number;
        username: string;
        discriminator: string;
        discordAvatar: string | null;
        discordId: string;
      }[],
      cur
    ) => {
      const placement = cur.player?.placements[0];
      if (!placement) return acc;

      if (acc.length < 4)
        acc.push({
          ...placement,
          username: cur.username,
          discriminator: cur.discriminator,
          discordAvatar: cur.discordAvatar,
          discordId: cur.discordId,
        });
      else {
        acc.sort((a, b) => b.xPower - a.xPower);

        if (acc[3].xPower < placement.xPower) {
          acc[3] = {
            ...placement,
            username: cur.username,
            discriminator: cur.discriminator,
            discordAvatar: cur.discordAvatar,
            discordId: cur.discordId,
          };
        }
      }
      return acc;
    },
    []
  );

  return {
    placements: placements.sort((a, b) => b.xPower - a.xPower),
    teamXP: (
      (placements.reduce((acc, cur) => acc + cur.xPower, 0) +
        2000 * (4 - placements.length)) /
      4
    )
      .toFixed(1)
      .replace(".0", ""),
  };
};

const TeamPage: React.FC<Props> = (props) => {
  const { secondaryBgColor } = useMyTheme();
  const { data } = useSWR<GetTeamData>(`/api/teams/${props.team!.id}`, {
    initialData: props.team!,
  });
  const team = data!;

  const [sending, setSending] = useState(false);
  const [profileModalIsOpen, setProfileModalIsOpen] = useState(false);
  const [user] = useUser();
  const toast = useToast();

  useEffect(() => {
    mutate(`/api/teams/${props.team!.id}`);
  }, []);

  const leaveTeam = async () => {
    if (!window.confirm(t`Leave the team?`)) {
      return;
    }

    setSending(true);

    const success = await sendData("POST", "/api/teams/leave");
    setSending(false);
    if (!success) return;

    mutate(`/api/teams/${props.team!.id}`);

    toast(getToastOptions(t`Left the team`, "success"));
  };

  const teamXPData = getTeamXPInfo(team.roster);

  return (
    <MyContainer>
      {profileModalIsOpen && (
        <TeamProfileModal
          team={team}
          closeModal={() => setProfileModalIsOpen(false)}
        />
      )}
      <Flex align="center" justify="center">
        {team.twitterName && (
          <TwitterAvatar twitterName={team.twitterName} size="lg" mr={2} />
        )}
        <Heading fontFamily="'Rubik', sans-serif" textAlign="center">
          {team.name}
        </Heading>

        {team.twitterName && (
          <a href={`https://twitter.com/${team.twitterName}`}>
            <IconButton
              aria-label="Link to Twitter"
              icon={<FaTwitter />}
              color="#1DA1F2"
              isRound
              variant="ghost"
              size="sm"
              ml={1}
            />
          </a>
        )}
      </Flex>

      {teamXPData.teamXP !== "2000" && (
        <Popover trigger="hover" variant="responsive">
          <PopoverTrigger>
            <Center>
              <Image src={`/layout/xsearch.png`} height={24} width={24} />
              <SubText ml={1}>{teamXPData.teamXP}</SubText>
            </Center>
          </PopoverTrigger>
          <PopoverContent bg={secondaryBgColor} p={6}>
            <PopoverArrow bg={secondaryBgColor} />
            {teamXPData.placements.map((placement, i) => (
              <Fragment key={placement.discordId}>
                <Flex align="center" justify="center">
                  <UserAvatar user={placement} isSmall />
                  <Box ml={1}>
                    {placement.username}#{placement.discriminator}
                  </Box>
                </Flex>
                <Flex align="center" justify="space-evenly" mt={4}>
                  <WeaponImage name={placement.weapon} size={32} />

                  <Flex align="center" justify="center">
                    <Image src={`/layout/xsearch.png`} height={24} width={24} />
                    <Box ml={1} fontSize="sm" fontWeight="bold">
                      {placement.xPower}
                    </Box>
                  </Flex>
                </Flex>
                {i !== teamXPData.placements.length - 1 && <Divider my={6} />}
              </Fragment>
            ))}
          </PopoverContent>
        </Popover>
      )}
      {user?.id === team.captainId && (
        <Center my={4}>
          <Stack direction={["column", "row"]} spacing={4}>
            <TeamManagementModal team={team} />
            <Button
              leftIcon={<FiEdit />}
              onClick={() => setProfileModalIsOpen(true)}
              size="sm"
            >
              <Trans>Edit team profile</Trans>
            </Button>
          </Stack>
        </Center>
      )}
      {user &&
        user.id !== team.captainId &&
        team.roster.some((teamMember) => user.id === teamMember.id) && (
          <Center my={4}>
            <Button
              variant="outline"
              colorScheme="red"
              onClick={leaveTeam}
              isLoading={sending}
              size="sm"
            >
              <Trans>Leave team</Trans>
            </Button>
          </Center>
        )}
      <Divider my={4} />
      {team.bio && <Markdown value={team.bio} smallHeaders />}
      {team.recruitingPost && (
        <SubTextCollapse title={t`Recruiting post`} mt={4}>
          <Markdown value={team.recruitingPost} smallHeaders />
        </SubTextCollapse>
      )}
      {(team.bio || team.recruitingPost) && <Divider my={4} />}
      <Wrap justify="center" spacing={4}>
        {team.roster
          .sort(
            (a, b) =>
              Number(b.id === team.captainId) - Number(a.id === team.captainId)
          )
          .map((user) => (
            <WrapItem key={user.id}>
              <Section textAlign="center" height="14rem" width="14rem">
                <MyLink href={`/u/${user.discordId}`} isColored={false}>
                  <UserAvatar user={user} size="lg" />
                </MyLink>
                <Box my={2} fontWeight="bold">
                  <MyLink
                    href={`/u/${user.discordId}`}
                    isColored={false}
                  >{`${user.username}#${user.discriminator}`}</MyLink>
                </Box>
                {user.profile?.country && (
                  <Box mx="auto" my={1}>
                    <Box as="span" mr={1}>
                      {getEmojiFlag(user.profile.country)}{" "}
                    </Box>
                    {
                      Object.entries(countries).find(
                        ([key]) => key === user.profile!.country
                      )![1].name
                    }
                  </Box>
                )}
                {(user.profile?.weaponPool ?? []).length > 0 && (
                  <Flex
                    mt={3}
                    w="100%"
                    alignItems="center"
                    justifyContent="center"
                  >
                    {user.profile!.weaponPool.map((wpn) => (
                      <Box mx="0.2em" key={wpn}>
                        <WeaponImage name={wpn} size={32} />
                      </Box>
                    ))}
                  </Flex>
                )}
              </Section>
            </WrapItem>
          ))}
      </Wrap>
    </MyContainer>
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const team = await getTeam({ nameForUrl: params!.team as string });

  if (!team) return { notFound: true };

  return {
    props: {
      team,
    },
    revalidate: 1,
  };
};

export default TeamPage;
