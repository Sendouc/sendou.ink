import { Badge, Box, Button, Flex, Grid, Heading } from "@chakra-ui/react";
import { Events } from "app/calendar/service";
import { eventImage, EVENT_FORMATS, TAGS } from "app/calendar/utils";
import Markdown from "components/common/Markdown";
import MyLink from "components/common/MyLink";
import OutlinedBox from "components/common/OutlinedBox";
import UserAvatar from "components/common/UserAvatar";
import { useMyTheme, useUser } from "hooks/common";
import Image from "next/image";
import React from "react";
import { FiClock, FiEdit, FiExternalLink } from "react-icons/fi";
import { DiscordIcon } from "utils/assets/icons";
import { ADMIN_ID } from "utils/constants";
import { Unpacked } from "utils/types";

interface EventInfoProps {
  event: Unpacked<Events>;
  edit: () => void;
}

const EventInfo = ({ event, edit }: EventInfoProps) => {
  const { gray, themeColorShade } = useMyTheme();
  const poster = event.poster;

  const [user] = useUser();

  const canEdit = user?.id === poster.id || user?.id === ADMIN_ID;

  const imgSrc = eventImage(event.name);

  return (
    <OutlinedBox
      my={4}
      py={4}
      data-cy={`event-info-section-${event.name
        .toLowerCase()
        .replace(/ /g, "-")}`}
    >
      <Box width="100%">
        <Box textAlign="center">
          <Box>
            {imgSrc && <Image src={imgSrc} width={36} height={36} />}
            <Heading size="lg">{event.name}</Heading>
            {event.tags.length > 0 && (
              <Flex flexWrap="wrap" justifyContent="center" mt={3} mb={2}>
                {event.tags.map((tag) => {
                  const tagInfo = TAGS.find((tagObj) => tagObj.code === tag)!;
                  return (
                    <Badge key={tag} mx={1} bg={tagInfo.color} color="black">
                      {tagInfo.name}
                    </Badge>
                  );
                })}
              </Flex>
            )}
            <Grid
              templateColumns={["1fr", "2fr 4fr 2fr"]}
              placeItems="center flex-start"
              gridRowGap="0.5rem"
              maxW="32rem"
              mx="auto"
              mt={1}
              mb={3}
            >
              <Flex placeItems="center" ml={[null, "auto"]} mx={["auto", null]}>
                <Box
                  as={FiClock}
                  mr="0.5em"
                  color={themeColorShade}
                  justifySelf="flex-end"
                />
                {/* TODO */}
                <Box as="time" dateTime={event.date.toISOString()}>
                  {event.date.toLocaleString("en", {
                    hour: "numeric",
                    minute: "numeric",
                  })}
                </Box>
              </Flex>
              <Flex placeItems="center" mx="auto">
                <Box
                  as={FiExternalLink}
                  mr="0.5em"
                  color={themeColorShade}
                  justifySelf="flex-end"
                />
                <MyLink href={event.eventUrl} isExternal>
                  {new URL(event.eventUrl).host}
                </MyLink>
              </Flex>
              <Flex placeItems="center" mr={[null, "auto"]} mx={["auto", null]}>
                <UserAvatar
                  user={event.poster}
                  size="sm"
                  justifySelf="flex-end"
                  mr={2}
                />
                <MyLink href={`/u/${poster.discordId}`} isColored={false}>
                  <Box>
                    {poster.username}#{poster.discriminator}
                  </Box>
                </MyLink>
              </Flex>
            </Grid>
          </Box>

          <Grid
            templateColumns={["1fr", canEdit ? "1fr 1fr" : "1fr"]}
            gridRowGap="1rem"
            gridColumnGap="1rem"
            maxW={["12rem", canEdit ? "24rem" : "18rem"]}
            mx="auto"
            mt={4}
          >
            {event.discordInviteUrl ? (
              <MyLink href={event.discordInviteUrl} isExternal>
                <Button
                  leftIcon={<DiscordIcon />}
                  size="sm"
                  variant="outline"
                  width="100%"
                >
                  Join Discord
                </Button>
              </MyLink>
            ) : (
              <div />
            )}
            {canEdit && (
              <Button
                leftIcon={<FiEdit />}
                size="sm"
                onClick={edit}
                variant="outline"
                data-cy={`edit-button-${event.name
                  .toLowerCase()
                  .replace(/ /g, "-")}`}
              >
                Edit event
              </Button>
            )}
          </Grid>
        </Box>
        <Box mt={8} mx="0.5rem" wordBreak="break-word">
          <Box color={gray} fontSize="small" mb={2}>
            {EVENT_FORMATS.find((format) => format.code === event.format)!.name}
          </Box>
          <Markdown smallHeaders value={event.description} />
        </Box>
      </Box>
    </OutlinedBox>
  );
};

export default EventInfo;
