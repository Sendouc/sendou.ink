import { Box, Flex, HStack } from "@chakra-ui/react";
import { t } from "@lingui/macro";
import Breadcrumbs from "components/common/Breadcrumbs";
import MyContainer from "components/common/MyContainer";
import SubText from "components/common/SubText";
import TwitterAvatar from "components/common/TwitterAvatar";
import UserAvatar from "components/common/UserAvatar";
import RegisterHeader from "components/play/RegisterHeader";
import { useLadderTeams } from "hooks/play";
import { useMyTheme } from "lib/useMyTheme";

const PlayPage = () => {
  const { gray } = useMyTheme();
  const { data } = useLadderTeams();

  return (
    <MyContainer>
      <Breadcrumbs pages={[{ name: t`Play` }]} />
      <Box fontSize="lg" fontWeight="bold">
        Next event: testing
      </Box>
      <RegisterHeader />
      <Box mt={4}>
        {data
          ?.sort((a, b) => b.roster.length - a.roster.length)
          .map((team) => {
            const teamTuple = team.roster
              .filter((member) => member.team)
              .map((member) => member.team)
              .reduce(
                (
                  acc: [
                    { name: string; twitterName: string; nameForUrl: string },
                    number
                  ][],
                  cur
                ) => {
                  const tuple = acc.find(([{ name }]) => name === cur!.name);
                  if (tuple) tuple[1]++;

                  acc.push([{ ...(cur as any) }, 1]);
                  return acc;
                },
                []
              )
              .find((tuple) => tuple[1] >= 3);
            return (
              <Box my={4}>
                {teamTuple ? (
                  <Flex fontWeight="bold" align="center">
                    {teamTuple[0].twitterName && (
                      <TwitterAvatar
                        twitterName={teamTuple[0].twitterName}
                        size="sm"
                        mr={1}
                      />
                    )}
                    {teamTuple[0].name}
                    {teamTuple[1] === 3 && <SubText ml={1}>+1</SubText>}
                  </Flex>
                ) : (
                  <HStack>
                    {team.roster.map((member) => (
                      <UserAvatar user={member} size="sm" />
                    ))}
                  </HStack>
                )}
                <Box color={gray} fontSize="sm" mt={2}>
                  {team.roster
                    .map((user) => `${user.username}#${user.discriminator}`)
                    .join(", ")}
                </Box>
              </Box>
            );
          })}
      </Box>
    </MyContainer>
  );
};

export default PlayPage;
