import { Box, Button, Flex, Grid, Heading } from "@chakra-ui/react";
import Markdown from "components/common/Markdown";
import MyLink from "components/common/MyLink";
import UserAvatar from "components/common/UserAvatar";
import { useMyTheme, useUser } from "hooks/common";
import React, { useState } from "react";
import { FaDiscord } from "react-icons/fa";
import { FiClock, FiEdit, FiInfo } from "react-icons/fi";
import { ADMIN_ID } from "utils/constants";
import { Unpacked } from "utils/types";
import { Events } from "../service";

interface EventInfoProps {
  event: Unpacked<Events>;
}

const TournamentInfo = ({ event }: EventInfoProps) => {
  const {
    secondaryBgColor,
    themeColorHex,
    gray,
    themeColorShade,
  } = useMyTheme();
  const [expanded, setExpanded] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const poster = event.poster;

  const [user] = useUser();

  const canEdit = user?.id === poster.id || user?.id === ADMIN_ID;

  return (
    <Box
      as="section"
      rounded="lg"
      overflow="hidden"
      boxShadow="md"
      bg={secondaryBgColor}
      p="20px"
      my={5}
    >
      <Box textAlign="center">
        <Box>
          <Heading fontFamily="'Rubik', sans-serif" size="lg">
            {event.name}
          </Heading>
          <Flex
            alignItems="center"
            justifyContent="center"
            color={gray}
            mt="0.5rem"
          >
            <Box as={FiClock} mr="0.5em" color={themeColorShade} />
            {/* TODO */}
            {event.date.toLocaleString("en", {
              weekday: "long",
              month: "long",
              day: "numeric",
              hour: "numeric",
              minute: "numeric",
            })}
          </Flex>

          <Flex
            alignItems="center"
            justifyContent="center"
            color={gray}
            mt="1.1rem"
            mb="0.5rem"
          >
            <Box mr="0.5em">
              <UserAvatar user={event.poster} size="sm" />
            </Box>{" "}
            <MyLink href={`/u/${poster.discordId}`} isColored={false}>
              <Box>
                {poster.username}#{poster.discriminator}
              </Box>
            </MyLink>
          </Flex>
        </Box>

        <Grid
          templateColumns={canEdit ? "1fr 1fr 1fr" : "1fr 1fr"}
          gridColumnGap="1rem"
          maxW={canEdit ? "32rem" : "24rem"}
          mx="auto"
          mt={6}
        >
          {/* TODO */}
          <Button leftIcon={<FaDiscord />} size="sm" variant="outline">
            Join Discord
          </Button>
          <Button
            leftIcon={<FiInfo />}
            size="sm"
            onClick={() => setExpanded(!expanded)}
            variant="outline"
          >
            View info
          </Button>
          {canEdit && (
            <Button
              leftIcon={<FiEdit />}
              size="sm"
              onClick={() => setShowModal(true)}
              variant="outline"
            >
              Edit event
            </Button>
          )}
        </Grid>
      </Box>
      {expanded && (
        <Box mt="1rem" mx="0.5rem">
          <Markdown value={event.description} />
        </Box>
      )}
    </Box>
  );
};

export default TournamentInfo;
