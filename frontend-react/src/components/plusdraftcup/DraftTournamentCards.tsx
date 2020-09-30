import { Box, Flex, Grid, Image } from "@chakra-ui/core";
import { Link } from "@reach/router";
import React, { useContext } from "react";
import { useTranslation } from "react-i18next";
import { medalEmoji } from "../../assets/imageImports";
import trophy from "../../assets/trophy.png";
import MyThemeContext from "../../themeContext";
import { months } from "../../utils/lists";
import Section from "../common/Section";
import Button from "../elements/Button";

interface DraftTournamentCardsProps {
  tournaments: {
    name: string;
    top_3_team_names: string[];
    top_3_discord_users: {
      username: string;
      discriminator: string;
      twitter_name?: string;
      discord_id: string;
    }[][];
    bracket_url: string;
    date: string;
    type: "DRAFTONE" | "DRAFTTWO";
  }[];
}

interface DraftTournamentCardProps {
  tournament: {
    name: string;
    top_3_team_names: string[];
    top_3_discord_users: {
      username: string;
      discriminator: string;
      twitter_name?: string;
      discord_id: string;
    }[][];
    bracket_url: string;
    date: string;
    type: "DRAFTONE" | "DRAFTTWO";
  };
  link?: string;
}

interface MedalRowProps {
  players: {
    username: string;
    discriminator: string;
    twitter_name?: string;
    discord_id: string;
  }[];
  medalImage: string;
  small?: boolean;
}

export const DraftTournamentCard: React.FC<DraftTournamentCardProps> = ({
  tournament,
  link,
}) => {
  const { t, i18n } = useTranslation();
  const { grayWithShade, themeColorWithShade } = useContext(MyThemeContext);

  const MedalRow: React.FC<MedalRowProps> = ({
    players,
    medalImage,
    small,
  }) => {
    return (
      <Flex
        alignItems="center"
        flexDirection="column"
        mt="1.5em"
        fontWeight="semibold"
        as="h4"
        flexWrap="wrap"
      >
        <Image
          w={small ? "30px" : "40px"}
          h="auto"
          src={medalImage}
          mr="0.5em"
        />
        {players.map((user, index) => (
          <Box
            color={index % 2 === 0 ? undefined : themeColorWithShade}
            mx="0.25em"
            key={`${user.username}#${user.discriminator}`}
          >
            <Link to={`/u/${user.discord_id}`}>
              {user.username}#{user.discriminator}
            </Link>
          </Box>
        ))}
      </Flex>
    );
  };

  return (
    <Section
      display="flex"
      overflow="hidden"
      w="100%"
      h="100%"
      flexDirection="column"
      justifyContent="space-between"
      alignItems="center"
      transition="all 0.2s"
    >
      <Box fontWeight="semibold" as="h4" lineHeight="tight" textAlign="center">
        {tournament.name}
      </Box>
      <Box
        color={grayWithShade}
        fontWeight="semibold"
        letterSpacing="wide"
        fontSize="xs"
        mt="0.5em"
        textAlign="center"
        textTransform="capitalize"
      >
        {new Date(parseInt(tournament.date)).toLocaleString(i18n.language, {
          month: "long",
          day: "numeric",
          year: "numeric",
        })}
      </Box>
      <MedalRow
        players={tournament.top_3_discord_users[0]}
        medalImage={trophy}
      />
      <MedalRow
        players={tournament.top_3_discord_users[1]}
        medalImage={medalEmoji[2]}
        small
      />
      <MedalRow
        players={tournament.top_3_discord_users[2]}
        medalImage={medalEmoji[3]}
        small
      />
      {link && (
        <Box mt="2em">
          <Link to={link}>
            <Button outlined>{t("draft;View matches")}</Button>
          </Link>
        </Box>
      )}
    </Section>
  );
};

const DraftTournamentCards: React.FC<DraftTournamentCardsProps> = ({
  tournaments,
}) => {
  return (
    <>
      <Grid
        gridGap="1em"
        gridTemplateColumns="repeat(auto-fit, minmax(260px, 1fr))"
        mt="1em"
      >
        {tournaments.map((tournament) => {
          const date = new Date(parseInt(tournament.date));
          return (
            <DraftTournamentCard
              key={tournament.name}
              tournament={tournament}
              link={`/draft/${
                tournament.type === "DRAFTTWO" ? "2" : "1"
              }-${months[
                date.getMonth() + 1
              ].toLowerCase()}-${date.getFullYear()}`}
            />
          );
        })}
      </Grid>
    </>
  );
};

export default DraftTournamentCards;
