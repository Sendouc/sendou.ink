import { Box, Divider, Flex, IconButton, useToast } from "@chakra-ui/react";
import { t, Trans } from "@lingui/macro";
import Flag from "components/common/Flag";
import Markdown from "components/common/Markdown";
import MyLink from "components/common/MyLink";
import SubText from "components/common/SubText";
import SubTextCollapse from "components/common/SubTextCollapse";
import UserAvatar from "components/common/UserAvatar";
import WeaponImage from "components/common/WeaponImage";
import { countries } from "countries-list";
import { useMyTheme } from "hooks/common";
import Image from "next/image";
import { RefObject } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import {
  RiAnchorLine,
  RiMicFill,
  RiPaintLine,
  RiSwordLine,
} from "react-icons/ri";
import { PostsData } from "services/freeagents";
import { getToastOptions } from "utils/objects";
import { trpc } from "utils/trpc";
import { Unpacked } from "utils/types";

const playstyleToEmoji = {
  FRONTLINE: RiSwordLine,
  MIDLINE: RiPaintLine,
  BACKLINE: RiAnchorLine,
} as const;

const FreeAgentSection = ({
  post,
  isLiked,
  canLike,
  showXp,
  showPlusServerMembership,
  postRef,
}: {
  post: Unpacked<PostsData>;
  isLiked: boolean;
  canLike: boolean;
  showXp: boolean;
  showPlusServerMembership: boolean;
  postRef?: RefObject<HTMLDivElement>;
}) => {
  const { themeColorShade } = useMyTheme();

  const toast = useToast();
  const utils = trpc.useQueryUtils();
  const addLikeMutation = trpc.useMutation("freeAgents.addLike", {
    onSuccess() {
      utils.invalidateQuery(["freeAgents.likes"]);
    },
    onError(error) {
      toast(getToastOptions(error.message, "error"));
    },
  });
  const deleteLikeMutation = trpc.useMutation("freeAgents.deleteLike", {
    onSuccess() {
      utils.invalidateQuery(["freeAgents.likes"]);
    },
    onError(error) {
      toast(getToastOptions(error.message, "error"));
    },
  });

  const handleClick = () =>
    isLiked
      ? deleteLikeMutation.mutate({ postId: post.id })
      : addLikeMutation.mutate({ postId: post.id });

  return (
    <>
      <Box ref={postRef} as="section" my={8}>
        <Flex alignItems="center" fontWeight="bold" fontSize="1.25rem">
          <UserAvatar user={post.user} mr={3} />
          <MyLink href={`/u/${post.user.discordId}`} isColored={false}>
            {post.user.username}#{post.user.discriminator}
          </MyLink>
        </Flex>

        {showXp ? (
          <Flex my={2} ml={1} align="center" fontSize="sm" fontWeight="bold">
            <Image src="/layout/xsearch.png" height={24} width={24} />
            <Box ml={1}>{post.user.player?.placements[0]?.xPower}</Box>
          </Flex>
        ) : null}

        {showPlusServerMembership ? (
          <Flex my={2} ml={1} align="center" fontSize="sm" fontWeight="bold">
            <Image src="/layout/plus.png" height={24} width={24} />
            <Box ml={1}>+{post.user.plusStatus?.membershipTier}</Box>
          </Flex>
        ) : null}

        {post.user.profile?.country && (
          <Flex align="center" ml={2} my={2}>
            <Box as="span" mr={1} mt={1}>
              <Flag countryCode={post.user.profile.country} />{" "}
            </Box>
            {
              Object.entries(countries).find(
                ([key]) => key === post.user.profile?.country
              )![1].name
            }
          </Flex>
        )}

        {post.user.profile && post.user.profile?.weaponPool.length > 0 && (
          <Box my={2}>
            {post.user.profile.weaponPool.map((wpn) => (
              <WeaponImage key={wpn} name={wpn} size={32} />
            ))}
          </Box>
        )}

        <Flex mt={4} mb={2}>
          {post.playstyles.map((style) => (
            <Box
              key={style}
              w={6}
              h={6}
              mx={1}
              color={themeColorShade}
              as={playstyleToEmoji[style]}
            />
          ))}
        </Flex>

        {post.canVC !== "NO" && (
          <Flex alignItems="center" my={4}>
            <Box
              w={6}
              h={6}
              mx={1}
              mr={2}
              color={themeColorShade}
              as={RiMicFill}
            />
            <SubText>
              {post.canVC === "YES" ? (
                <Trans>Can VC</Trans>
              ) : (
                <Trans>Can VC sometimes</Trans>
              )}
            </SubText>
          </Flex>
        )}

        <SubTextCollapse
          title={t`Free agent post`}
          isOpenByDefault
          mt={4}
          my={6}
        >
          <Markdown value={post.content} smallHeaders />
        </SubTextCollapse>
        {post.user.profile?.bio && (
          <SubTextCollapse title={t`Bio`} mt={4}>
            <Markdown value={post.user.profile.bio} smallHeaders />
          </SubTextCollapse>
        )}
        {canLike && (
          <IconButton
            color="red.500"
            aria-label="Like"
            size="lg"
            isRound
            mt={4}
            variant="ghost"
            icon={isLiked ? <FaHeart /> : <FaRegHeart />}
            disabled={addLikeMutation.isLoading || deleteLikeMutation.isLoading}
            onClick={handleClick}
          />
        )}
      </Box>
      <Divider />
    </>
  );
};

export default FreeAgentSection;
