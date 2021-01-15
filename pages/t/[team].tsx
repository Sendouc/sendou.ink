import {
  Box,
  Button,
  Center,
  Divider,
  Flex,
  Heading,
  IconButton,
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
import SubTextCollapse from "components/common/SubTextCollapse";
import TwitterAvatar from "components/common/TwitterAvatar";
import UserAvatar from "components/common/UserAvatar";
import WeaponImage from "components/common/WeaponImage";
import TeamManagementModal from "components/t/TeamManagementModal";
import TeamProfileModal from "components/t/TeamProfileModal";
import { countries, getEmojiFlag } from "countries-list";
import { getToastOptions } from "lib/getToastOptions";
import { sendData } from "lib/postData";
import useUser from "lib/useUser";
import { GetStaticPaths, GetStaticProps } from "next";
import { getTeam, GetTeamData } from "prisma/queries/getTeam";
import { useEffect, useState } from "react";
import { FaTwitter } from "react-icons/fa";
import useSWR, { mutate } from "swr";

interface Props {
  team: GetTeamData;
}

const TeamPage: React.FC<Props> = (props) => {
  const { data } = useSWR<GetTeamData>(`/api/teams/${props.team!.id}`, {
    initialData: props.team!,
  });
  const team = data!;

  const [sending, setSending] = useState(false);
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

  return (
    <MyContainer>
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
      {/* <Box textAlign="center">
        {team.roster
          .reduce((acc: [string, number][], cur) => {
            if (!cur.profile?.country) return acc;

            const countryTuple = acc.find(
              ([country]) => country === cur.profile?.country
            );
            if (!countryTuple) acc.push([cur.profile.country, 1]);
            else countryTuple[1]++;

            return acc;
          }, [])
          .sort((a, b) => b[1] - a[1])
          .map(([country]) => getEmojiFlag(country))}
      </Box> */}
      {user?.id === team.captainId && (
        <Center my={4}>
          <Stack direction={["column", "row"]} spacing={4}>
            <TeamManagementModal team={team} />
            <TeamProfileModal team={team} />
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
      <Divider mt={4} mb={8} />
      {team.bio && <Markdown value={team.bio} smallHeaders />}
      {team.recruitingPost && (
        <SubTextCollapse title={t`Recruiting post`} mt={4}>
          <Markdown value={team.recruitingPost} smallHeaders />
        </SubTextCollapse>
      )}
      {(team.bio || team.recruitingPost) && <Divider mb={4} mt={8} />}
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
  };
};

export default TeamPage;
