import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  Center,
  Radio,
  RadioGroup,
  Stack,
} from "@chakra-ui/react";
import { Trans } from "@lingui/macro";
import { Playstyle } from "@prisma/client";
import { useFreeAgents } from "app/freeAgents/hooks";
import { useUser } from "hooks/common";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { mutate } from "swr";
import { sendData } from "utils/postData";
import FAModal from "./FAModal";
import FreeAgentSection from "./FreeAgentSection";
import MatchesInfo from "./MatchesInfo";

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
        <FreeAgentSection
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

export default FreeAgentsPage;
