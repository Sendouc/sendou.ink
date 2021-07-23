import { Box, BoxProps, Flex, HStack } from "@chakra-ui/react";
import SubText from "components/common/SubText";
import TwitterAvatar from "components/common/TwitterAvatar";
import UserAvatar from "components/common/UserAvatar";
import { CSSVariables } from "utils/CSSVariables";
import { GetAllLadderRegisteredTeamsData } from "prisma/queries/getAllLadderRegisteredTeams";
import { Unpacked } from "utils/types";

interface Props {
  roster: Unpacked<GetAllLadderRegisteredTeamsData>["roster"];
}

const LadderTeam: React.FC<Props & BoxProps> = ({ roster, ...props }) => {
  const teamTuple = roster
    .filter((member) => member.team)
    .map((member) => member.team)
    .reduce(
      (
        acc: [
          {
            name: string;
            twitterName: string;
            nameForUrl: string;
          },
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
    <Box {...props}>
      {teamTuple && roster.length === 4 ? (
        <Flex fontWeight="bold" align="center">
          {teamTuple[0].twitterName && (
            <TwitterAvatar
              twitterName={teamTuple[0].twitterName}
              size="sm"
              mr={1}
            />
          )}
          {teamTuple[0].name}
          {teamTuple[1] === 3 && roster.length >= 4 && (
            <SubText ml={1}>+1</SubText>
          )}
        </Flex>
      ) : (
        <HStack>
          {roster.map((member) => (
            <UserAvatar key={member.id} user={member} size="sm" />
          ))}
        </HStack>
      )}
      <Box color={CSSVariables.themeGray} fontSize="sm" mt={2}>
        {roster
          .map((user) => `${user.username}#${user.discriminator}`)
          .join(", ")}
      </Box>
    </Box>
  );
};

export default LadderTeam;
