import {
    Avatar, AvatarGroup, Box, Flex,

    Popover,


    PopoverArrow, PopoverContent, PopoverTrigger
} from "@chakra-ui/react";
import React, { useContext } from "react";
import { Trans, useTranslation } from "react-i18next";
import MyThemeContext from "../../themeContext";
import FieldsetWithLegend from "../common/FieldsetWithLegend";
import UserAvatar from "../common/UserAvatar";

interface MatchesProps {
  matches: {
    username: string;
    discriminator: string;
    avatar?: string;
  }[];
  likesReceived: number;
}

const Matches: React.FC<MatchesProps> = ({ matches, likesReceived }) => {
  const { t } = useTranslation();
  const { grayWithShade, darkerBgColor } = useContext(MyThemeContext);

  if (matches.length === 0 && likesReceived === 0) return null;

  const unrequitedLove = likesReceived - matches.length;

  return (
    <Flex justifyContent="center">
      <FieldsetWithLegend
        title={t("freeagents;MATCHES")}
        titleFontSize="xs"
        minW="250px"
      >
        {matches.length > 0 && (
          <>
            <Flex justifyContent="center" flexWrap="wrap">
              {matches.map((match) => {
                const matchFullName = `${match.username}#${match.discriminator}`;
                return (
                  <Box
                    key={`${match.username}${match.discriminator}`}
                    p="0.5em"
                  >
                    <Popover trigger="hover">
                      <PopoverTrigger>
                        <Box>
                          <UserAvatar
                            src={match.avatar}
                            name={match.username}
                          />
                        </Box>
                      </PopoverTrigger>
                      <PopoverContent zIndex={4} p="0.5em" bg={darkerBgColor}>
                        <PopoverArrow />
                        <Box>
                          <Trans i18nKey="freeagents;youHaveAMatch">
                            You have a match with <b>{{ matchFullName }}</b>!
                            Contact them to see if you can get a team going{" "}
                          </Trans>
                        </Box>
                      </PopoverContent>
                    </Popover>
                  </Box>
                );
              })}
            </Flex>
          </>
        )}
        {unrequitedLove > 0 && (
          <>
            <Flex justifyContent="center" mt="1em">
              <AvatarGroup size="md" max={3}>
                {Array(unrequitedLove)
                  .fill(1)
                  .map((_, i) => (
                    <Avatar key={i} name="?a" />
                  ))}
              </AvatarGroup>
            </Flex>
            <Box color={grayWithShade} mt="0.5em" fontSize="15px">
              {t("freeagents;getLiking", { count: unrequitedLove })}
            </Box>
          </>
        )}
      </FieldsetWithLegend>
    </Flex>
  );
};

export default Matches;
