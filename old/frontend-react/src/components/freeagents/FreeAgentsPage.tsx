import { useQuery } from "@apollo/client";
import { Box, Button, Collapse, Flex } from "@chakra-ui/core";
import { RouteComponentProps } from "@reach/router";
import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { FaFilter } from "react-icons/fa";
import {
  FreeAgentMatchesData,
  FREE_AGENT_MATCHES,
} from "../../graphql/queries/freeAgentMatches";
import { FREE_AGENT_POSTS } from "../../graphql/queries/freeAgentPosts";
import { USER } from "../../graphql/queries/user";
import {
  FreeAgentPost,
  FreeAgentPostsData,
  UserData,
  Weapon,
} from "../../types";
import { continents } from "../../utils/lists";
import Error from "../common/Error";
import Loading from "../common/Loading";
import PageHeader from "../common/PageHeader";
import WeaponSelector from "../common/WeaponSelector";
import Alert from "../elements/Alert";
import RadioGroup from "../elements/RadioGroup";
import FAPostModal from "./FAPostModal";
import Matches from "./Matches";
import Posts from "./Posts";

const playstyleToEnum = {
  "Frontline/Slayer": "FRONTLINE",
  "Midline/Support": "MIDLINE",
  "Backline/Anchor": "BACKLINE",
} as const;

const FreeAgentsPage: React.FC<RouteComponentProps> = () => {
  const { t } = useTranslation();
  const [weapon, setWeapon] = useState<Weapon | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [playstyle, setPlaystyle] = useState<
    "Any" | "Frontline/Slayer" | "Midline/Support" | "Backline/Anchor"
  >("Any");
  const [region, setRegion] = useState<
    "Any" | "Europe" | "The Americas" | "Oceania" | "Other"
  >("Any");
  const { data, error, loading } = useQuery<FreeAgentPostsData>(
    FREE_AGENT_POSTS
  );
  const {
    data: userData,
    error: userQueryError,
    loading: userQueryLoading,
  } = useQuery<UserData>(USER);
  const { data: matchesData, error: matchesError } = useQuery<
    FreeAgentMatchesData
  >(FREE_AGENT_MATCHES);

  if (error) return <Error errorMessage={error.message} />;
  if (userQueryError) return <Error errorMessage={userQueryError.message} />;
  if (matchesError) return <Error errorMessage={matchesError.message} />;
  if (loading || userQueryLoading) return <Loading />;

  const faPosts = data!.freeAgentPosts;

  const ownFAPost = faPosts.find(
    (post) => post.discord_user.discord_id === userData!.user?.discord_id
  );

  const buttonText =
    ownFAPost && !ownFAPost.hidden
      ? t("freeagents;Edit free agent post")
      : t("freeagents;New free agent post");

  const altWeaponMap = new Map([
    ["Splattershot", "Hero Shot Replica"],
    ["Tentatek Splattershot", "Octo Shot Replica"],
    ["Blaster", "Hero Blaster Replica"],
    ["Splat Roller", "Hero Roller Replica"],
    ["Octobrush", "Herobrush Replica"],
    ["Splat Charger", "Hero Charger Replica"],
    ["Slosher", "Hero Slosher Replica"],
    ["Heavy Splatling", "Hero Splatling Replica"],
    ["Splat Dualies", "Hero Dualie Replicas"],
    ["Splat Brella", "Hero Brella Replica"],
  ]);

  const postsFilter = (post: FreeAgentPost) => {
    if (post.hidden) return false;

    const usersWeapons = post.discord_user.weapons ?? [];

    if (
      weapon &&
      !(
        usersWeapons.includes(weapon) ||
        usersWeapons.includes(altWeaponMap.get(weapon) as any)
      )
    ) {
      return false;
    }

    if (playstyle !== "Any") {
      if (post.playstyles.indexOf(playstyleToEnum[playstyle]) === -1)
        return false;
    }

    if (region !== "Any") {
      if (!post.discord_user.country) {
        if (region === "Other") return true;

        return false;
      }

      const continentCode = continents[post.discord_user.country];

      if (region === "Europe" && continentCode !== "EU") return false;
      else if (
        region === "The Americas" &&
        continentCode !== "NA" &&
        continentCode !== "SA"
      )
        return false;
      else if (region === "Oceania" && continentCode !== "OC") return false;
      else if (
        region === "Other" &&
        continentCode !== "AF" &&
        continentCode !== "AN" &&
        continentCode !== "AS" &&
        continentCode !== "OC"
      )
        return false;
    }

    return true;
  };

  const getTopRightContent = () => {
    if (!userData!.user)
      return (
        <Box maxW="300px">
          <Alert status="info" mt="0">
            {t("freeagents;loginPrompt")}
          </Alert>
        </Box>
      );

    if (ownFAPost && ownFAPost.hidden) {
      const weekFromCreatingFAPost = parseInt(ownFAPost.createdAt) + 604800000;
      if (weekFromCreatingFAPost > Date.now()) {
        return (
          <Box maxW="300px">
            <Alert status="info" mt="0">
              {t("freeagents;pleaseWaitPrompt")}
            </Alert>
          </Box>
        );
      }
    }

    return (
      <Box m="0.5em">
        <Button onClick={() => setShowModal(true)}>{buttonText}</Button>
      </Box>
    );
  };

  return (
    <>
      <Helmet>
        <title>{t("navigation;Free Agents")} | sendou.ink</title>
      </Helmet>
      <PageHeader title={t("navigation;Free Agents")} />
      {showModal && (
        <FAPostModal
          closeModal={() => setShowModal(false)}
          post={ownFAPost?.hidden ? undefined : ownFAPost}
        />
      )}
      <Flex justifyContent="space-between" flexWrap="wrap">
        <Box m="0.5em">
          <Button
            leftIcon={<FaFilter />}
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters
              ? t("freeagents;Hide filters")
              : t("freeagents;Show filters")}
          </Button>
        </Box>
        {getTopRightContent()}
      </Flex>
      <Collapse mt={4} isOpen={showFilters}>
        <Box maxW="600px" my="1em">
          <RadioGroup
            value={playstyle}
            setValue={setPlaystyle}
            label={t("freeagents;Playstyle")}
            options={[
              { value: "Any", label: t("freeagents;Any") },
              {
                value: "Frontline/Slayer",
                label: t("freeagents;Frontline/Slayer"),
              },
              {
                value: "Midline/Support",
                label: t("freeagents;Midline/Support"),
              },
              {
                value: "Backline/Anchor",
                label: t("freeagents;Backline/Anchor"),
              },
            ]}
          ></RadioGroup>
        </Box>
        <Box maxW="600px" my="1em">
          <RadioGroup
            value={region}
            setValue={setRegion}
            label={t("freeagents;Region")}
            options={[
              { value: "Any", label: t("freeagents;Any") },
              { value: "Europe", label: t("freeagents;Europe") },
              { value: "The Americas", label: t("freeagents;The Americas") },
              { value: "Oceania", label: t("freeagents;Oceania") },
              { value: "Other", label: t("freeagents;Other") },
            ]}
          />
        </Box>
        <Box maxW="600px" my="1em">
          <WeaponSelector
            label="Weapon"
            value={weapon}
            setValue={(weapon: string) => setWeapon(weapon as Weapon)}
            clearable
          />
        </Box>
      </Collapse>
      {matchesData && (
        <Box mt="1em">
          <Matches
            matches={matchesData.freeAgentMatches.matched_discord_users}
            likesReceived={
              matchesData.freeAgentMatches.number_of_likes_received
            }
          />
        </Box>
      )}
      <Posts
        posts={faPosts.filter(postsFilter)}
        canLike={!!(ownFAPost && !ownFAPost.hidden)}
        likedUsersIds={
          !matchesData ? [] : matchesData.freeAgentMatches.liked_discord_ids
        }
      />
    </>
  );
};

export default FreeAgentsPage;
