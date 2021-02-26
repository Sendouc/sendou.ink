import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  Center,
  Divider,
  Flex,
  IconButton,
  Radio,
  RadioGroup,
  Stack,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import { t, Trans } from "@lingui/macro";
import { Playstyle } from "@prisma/client";
import Markdown from "components/common/Markdown";
import MyLink from "components/common/MyLink";
import SubText from "components/common/SubText";
import SubTextCollapse from "components/common/SubTextCollapse";
import UserAvatar from "components/common/UserAvatar";
import WeaponImage from "components/common/WeaponImage";
import FAModal from "components/freeagents/FAModal";
import HeaderBanner from "components/layout/HeaderBanner";
import { countries, getEmojiFlag } from "countries-list";
import { useMyTheme, useUser } from "hooks/common";
import { useFreeAgents } from "hooks/freeagents";
import { sendData } from "lib/postData";
import { Unpacked } from "lib/types";
import { useRouter } from "next/router";
import { GetAllFreeAgentPostsData } from "prisma/queries/getAllFreeAgentPosts";
import { RefObject, useEffect, useRef, useState } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import {
  RiAnchorLine,
  RiMicFill,
  RiPaintLine,
  RiSwordLine,
} from "react-icons/ri";
import { mutate } from "swr";

const FreeAgentsPage = () => {
  const {
    postsData,
    likesData,
    isLoading,
    usersPost,
    matchedPosts,
    playstyleCounts,
    state,
    dispatch,
  } = useFreeAgents();
  const [user] = useUser();
  const router = useRouter();

  const [postIdToScrollTo, setPostIdToScrollTo] = useState<undefined | number>(
    undefined
  );
  const [sending, setSending] = useState(false);
  const postRef = useRef<HTMLDivElement>(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  useEffect(() => {
    if (!postRef.current) return;

    postRef.current.scrollIntoView();
  }, [postRef.current]);

  const dateThreeWeeksAgo = new Date();
  dateThreeWeeksAgo.setDate(dateThreeWeeksAgo.getDate() - 7 * 3);

  const onPostRefresh = async () => {
    setSending(true);

    const success = await sendData("PUT", "/api/freeagents", {
      canVC: usersPost!.canVC,
      playstyles: usersPost!.playstyles,
      content: usersPost!.content,
    });
    setSending(false);
    if (!success) return;

    mutate("/api/freeagents");
  };

  return (
    <>
      {modalIsOpen && (
        <FAModal post={usersPost} onClose={() => setModalIsOpen(false)} />
      )}
      <Button size="sm" onClick={() => setModalIsOpen(true)}>
        {usersPost ? (
          <Trans>Edit free agent post</Trans>
        ) : (
          <Trans>New free agent post</Trans>
        )}
      </Button>
      {usersPost &&
        usersPost.updatedAt.getTime() < dateThreeWeeksAgo.getTime() && (
          <Alert
            status="warning"
            variant="subtle"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            textAlign="center"
            mx="auto"
            mt={6}
          >
            <AlertIcon boxSize="40px" mr={0} />
            <AlertTitle mt={4} mb={1} fontSize="lg">
              <Trans>Your free agent post is about to expire</Trans>
            </AlertTitle>
            <AlertDescription maxWidth="sm">
              <Trans>
                Free agent posts that haven't been updated in over a month will
                be hidden. Please press the button below if you are still a free
                agent.
              </Trans>

              <Box>
                <Button
                  mt={4}
                  variant="outline"
                  onClick={onPostRefresh}
                  isLoading={sending}
                >
                  <Trans>I'm still a free agent</Trans>
                </Button>
              </Box>
            </AlertDescription>
          </Alert>
        )}
      {!isLoading && (
        <Center mt={6}>
          <RadioGroup
            value={state.playstyle ?? "ALL"}
            onChange={(value) =>
              dispatch({
                type: "SET_PLAYSTYLE",
                playstyle: value === "ALL" ? undefined : (value as Playstyle),
              })
            }
          >
            <Stack spacing={4} direction={["column", "row"]}>
              <Radio value="ALL">
                <Trans>
                  All (
                  {playstyleCounts.FRONTLINE +
                    playstyleCounts.MIDLINE +
                    playstyleCounts.BACKLINE}
                  )
                </Trans>
              </Radio>
              <Radio value="FRONTLINE">
                <Trans>Frontline ({playstyleCounts.FRONTLINE})</Trans>
              </Radio>
              <Radio value="MIDLINE">
                <Trans>Support ({playstyleCounts.MIDLINE})</Trans>
              </Radio>
              <Radio value="BACKLINE">
                <Trans>Backline ({playstyleCounts.BACKLINE})</Trans>
              </Radio>
            </Stack>
          </RadioGroup>
        </Center>
      )}
      {usersPost && likesData ? (
        <MatchesInfo
          matchedPosts={matchedPosts}
          focusOnMatch={(id) => setPostIdToScrollTo(id)}
        />
      ) : null}
      {postsData.map((post) => (
        <FreeAgentCard
          key={post.id}
          post={post}
          isLiked={!!likesData?.likedPostIds.includes(post.id)}
          canLike={
            !!user && post.user.discordId !== user.discordId && !!usersPost
          }
          postRef={post.id === getIdToScrollTo() ? postRef : undefined}
        />
      ))}
    </>
  );

  function getIdToScrollTo() {
    if (postIdToScrollTo) return postIdToScrollTo;

    return Number.isNaN(parseInt(router.query.id as any))
      ? undefined
      : parseInt(router.query.id as any);
  }
};

const MatchesInfo = ({
  matchedPosts,
  focusOnMatch,
}: {
  matchedPosts: (Unpacked<GetAllFreeAgentPostsData> | undefined)[];
  focusOnMatch: (id: number) => void;
}) => {
  if (!matchedPosts.length)
    return (
      <Alert status="info" my={6}>
        <AlertIcon />
        <Trans>
          Once you match with other free agents they are shown here.
        </Trans>
      </Alert>
    );

  return (
    <Flex flexDir="column" align="center">
      <SubText mt={4}>
        <Trans>Matches</Trans>
      </SubText>
      <Wrap mt={4} mb={2}>
        {matchedPosts.map((post) =>
          post ? (
            <WrapItem key={post.id}>
              <UserAvatar
                user={post.user}
                onClick={() => focusOnMatch(post.id)}
                cursor="pointer"
              />
            </WrapItem>
          ) : null
        )}
      </Wrap>
    </Flex>
  );
};

const playstyleToEmoji = {
  FRONTLINE: RiSwordLine,
  MIDLINE: RiPaintLine,
  BACKLINE: RiAnchorLine,
} as const;

const FreeAgentCard = ({
  post,
  isLiked,
  canLike,
  postRef,
}: {
  post: Unpacked<GetAllFreeAgentPostsData>;
  isLiked: boolean;
  canLike: boolean;
  postRef?: RefObject<HTMLDivElement>;
}) => {
  const { themeColorShade } = useMyTheme();

  const handleClick = async () => {
    const success = await sendData(
      isLiked ? "DELETE" : "PUT",
      "/api/freeagents/like",
      {
        postId: post.id,
      }
    );

    if (success) mutate("/api/freeagents/like");
  };

  return (
    <>
      <Box ref={postRef} as="section" my={8}>
        <Flex alignItems="center" fontWeight="bold" fontSize="1.25rem">
          <UserAvatar user={post.user} mr={3} />
          <MyLink href={`/u/${post.user.discordId}`} isColored={false}>
            {post.user.username}#{post.user.discriminator}
          </MyLink>
        </Flex>

        {post.user.profile?.country && (
          <Box ml={2} my={2}>
            <Box as="span" mr={2}>
              {getEmojiFlag(post.user.profile.country)}{" "}
            </Box>
            {
              Object.entries(countries).find(
                ([key]) => key === post.user.profile?.country
              )![1].name
            }
          </Box>
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
            onClick={handleClick}
          />
        )}
      </Box>
      <Divider />
    </>
  );
};

FreeAgentsPage.header = (
  <HeaderBanner
    icon="freeagents"
    title="Free Agents"
    subtitle="Meet your next teammates"
  />
);

export default FreeAgentsPage;
