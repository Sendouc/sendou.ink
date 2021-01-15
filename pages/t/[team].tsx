import {
  Box,
  Button,
  Center,
  Divider,
  Flex,
  Heading,
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
import { FiTrash } from "react-icons/fi";
import useSWR, { mutate } from "swr";

interface Props {
  team: GetTeamData;
}

const TeamPage: React.FC<Props> = (props) => {
  const { data } = useSWR<GetTeamData>(`/api/teams/${props.team!.id}`, {
    initialData: props.team!,
  });
  const team = data!;

  console.log("team", team);

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
      <Heading fontFamily="'Rubik', sans-serif" textAlign="center">
        {team.name}
      </Heading>
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
        <Center my={2}>
          <TeamManagementModal team={team} />
          <TeamProfileModal team={team} />
        </Center>
      )}
      {user &&
        user.id !== team.captainId &&
        team.roster.some((teamMember) => user.id === teamMember.id) && (
          <Button
            leftIcon={<FiTrash />}
            variant="outline"
            colorScheme="red"
            onClick={leaveTeam}
            isLoading={sending}
          >
            <Trans>Leave team</Trans>
          </Button>
        )}
      <Divider my={8} />
      {team.bio && <Markdown value={team.bio} smallHeaders />}
      {team.recruitingPost && (
        <SubTextCollapse title={t`Recruiting post`} mt={4}>
          <Markdown value={team.recruitingPost} smallHeaders />
        </SubTextCollapse>
      )}
      {(team.bio || team.recruitingPost) && <Divider my={8} />}
      <Wrap justify="center">
        {team.roster
          .sort(
            (a, b) =>
              Number(a.id === team.captainId) - Number(b.id === team.captainId)
          )
          .map((user) => (
            <WrapItem key={user.id}>
              <Section textAlign="center">
                <MyLink href={`/u/${user.discordId}`} isColored={false}>
                  <UserAvatar user={user} />
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
