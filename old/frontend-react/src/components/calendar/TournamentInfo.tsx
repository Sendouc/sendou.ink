import { useQuery } from "@apollo/client";
import { Box, Flex, Heading, Image } from "@chakra-ui/core";
import { Link } from "@reach/router";
import React, { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { FiClock, FiEdit, FiInfo } from "react-icons/fi";
import { DiscordIcon } from "../../assets/icons";
import { CompetitiveFeedEvent } from "../../graphql/queries/upcomingEvents";
import { USER } from "../../graphql/queries/user";
import MyThemeContext from "../../themeContext";
import { UserData } from "../../types";
import Section from "../common/Section";
import UserAvatar from "../common/UserAvatar";
import IconButton from "../elements/IconButton";
import Markdown from "../elements/Markdown";
import TournamentModal from "./TournamentModal";

interface TournamentInfoProps {
  tournament: CompetitiveFeedEvent;
  date: Date;
  expandedByDefault?: boolean;
}

const TournamentInfo: React.FC<TournamentInfoProps> = ({
  tournament,
  date,
  expandedByDefault,
}) => {
  const { themeColorWithShade, grayWithShade } = useContext(MyThemeContext);
  const { i18n } = useTranslation();
  const [expanded, setExpanded] = useState(!!expandedByDefault);
  const [showModal, setShowModal] = useState(false);
  const poster = tournament.poster_discord_user;

  const { data: userData } = useQuery<UserData>(USER);

  return (
    <Section my={5}>
      {showModal && (
        <TournamentModal
          competitiveFeedEvent={tournament}
          closeModal={() => setShowModal(false)}
        />
      )}
      <Box textAlign="center">
        <Box>
          <Heading
            fontFamily="'Rubik', sans-serif"
            size="lg"
            color={!!expandedByDefault ? themeColorWithShade : undefined}
          >
            {tournament.name}
          </Heading>
          <Flex
            alignItems="center"
            justifyContent="center"
            color={grayWithShade}
            mt="0.5rem"
          >
            <Box as={FiClock} mr="0.5em" color={themeColorWithShade} />
            {date.toLocaleString(i18n.language, {
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
            color={grayWithShade}
            mt="1.1rem"
            mb="0.5rem"
          >
            {poster.avatar && (
              <Box mr="0.5em">
                <UserAvatar
                  name={poster.username}
                  src={poster.avatar}
                  size="sm"
                />
              </Box>
            )}{" "}
            <Link to={`/u/${poster.discord_id}`}>
              <Box>
                {poster.username}#{poster.discriminator}
              </Box>
            </Link>
          </Flex>
        </Box>

        <Flex justifyContent="center">
          <Box mx="1em">
            <a href={tournament.discord_invite_url}>
              <IconButton colored icon={<DiscordIcon />} />
            </a>
          </Box>
          <Box mx="1em">
            <IconButton
              colored
              icon={<FiInfo />}
              onClick={() => setExpanded(!expanded)}
            />
          </Box>
          {userData?.user?.discord_id === poster.discord_id && (
            <IconButton
              colored
              icon={<FiEdit />}
              onClick={() => setShowModal(true)}
            />
          )}
        </Flex>
      </Box>
      {expanded && (
        <Box mt="1rem" mx="0.5rem">
          <Markdown value={tournament.description} />
          {tournament.picture_url && (
            <Image
              borderRadius="5px"
              maxH="500px"
              mx="auto"
              src={tournament.picture_url}
            />
          )}
        </Box>
      )}
    </Section>
  );
};

export default TournamentInfo;
