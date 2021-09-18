import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  Flex,
} from "@chakra-ui/react";
import { Trans } from "@lingui/macro";
import FAFilters from "components/freeagents/FAFilters";
import FAModal from "components/freeagents/FAModal";
import FreeAgentSection from "components/freeagents/FreeAgentSection";
import MatchesInfo from "components/freeagents/MatchesInfo";
import { useMutation, useUser } from "hooks/common";
import { useFreeAgents } from "hooks/freeagents";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { CSSVariables } from "utils/CSSVariables";
import freeAgentsService from "services/freeagents";
import { GetStaticProps } from "next";
import { serializeDataForGetStaticProps } from "utils/objects";
import { FreeAgentsGet } from "./api/free-agents";
import * as z from "zod";
import { freeAgentPostSchema } from "utils/validators/fapost";

interface Props {
  postsInitialData: FreeAgentsGet;
}

type FreeAgentPostSchemaInput = z.infer<typeof freeAgentPostSchema>;

const FreeAgentsPage = ({ postsInitialData }: Props) => {
  const {
    postsData,
    refetchPosts,
    likesData,
    isLoading,
    usersPost,
    matchedPosts,
    allPostsCount,
    state,
    dispatch,
  } = useFreeAgents(postsInitialData);
  const [user] = useUser();
  const router = useRouter();

  const [postIdToScrollTo, setPostIdToScrollTo] = useState<undefined | number>(
    undefined
  );
  const postRef = useRef<HTMLDivElement>(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const refreshPostMutation = useMutation<FreeAgentPostSchemaInput>({
    url: "/api/free-agents",
    method: "POST",
    successToastMsg: "Free agent post refreshed",
    afterSuccess: () => {
      refetchPosts();
    },
  });

  useEffect(() => {
    if (!postRef.current) {
      return;
    }

    postRef.current.scrollIntoView();
  }, []);

  const dateThreeWeeksAgo = new Date();
  dateThreeWeeksAgo.setDate(dateThreeWeeksAgo.getDate() - 7 * 3);

  const usersPostForRefresh = () => {
    if (!usersPost) return;
    const { id, user, updatedAt, ...result } = usersPost;

    return result;
  };

  return (
    <>
      {modalIsOpen && (
        <FAModal
          post={usersPost}
          onClose={() => setModalIsOpen(false)}
          refetchQuery={refetchPosts}
        />
      )}
      {user && (
        <Button size="sm" onClick={() => setModalIsOpen(true)}>
          {usersPost ? (
            <Trans>Edit free agent post</Trans>
          ) : (
            <Trans>New free agent post</Trans>
          )}
        </Button>
      )}
      {usersPost &&
        new Date(usersPost.updatedAt).getTime() <
          dateThreeWeeksAgo.getTime() && (
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
                Free agent posts that haven&apos;t been updated in over a month
                will be hidden. Please press the button below if you are still a
                free agent.
              </Trans>

              <Box>
                <Button
                  mt={4}
                  variant="outline"
                  onClick={() =>
                    refreshPostMutation.mutate(usersPostForRefresh())
                  }
                  isLoading={refreshPostMutation.isMutating}
                >
                  <Trans>I&apos;m still a free agent</Trans>
                </Button>
              </Box>
            </AlertDescription>
          </Alert>
        )}

      {usersPost && likesData ? (
        <MatchesInfo
          matchedPosts={matchedPosts}
          focusOnMatch={(id) => setPostIdToScrollTo(id)}
        />
      ) : null}
      {!isLoading && <FAFilters state={state} dispatch={dispatch} />}
      {allPostsCount > 0 && (
        <Flex
          align="center"
          fontSize="small"
          color={CSSVariables.themeGray}
          mt={4}
        >
          Showing {postsData.length} posts out of {allPostsCount}{" "}
          <Button
            onClick={() => dispatch({ type: "RESET_FILTERS" })}
            visibility={
              postsData.length === allPostsCount ? "hidden" : "visible"
            }
            ml={2}
            size="sm"
            variant="ghost"
          >
            Reset filters
          </Button>
        </Flex>
      )}
      {postsData.map((post) => (
        <FreeAgentSection
          key={post.id}
          post={post}
          isLiked={!!likesData?.likedPostIds.includes(post.id)}
          canLike={
            !!user && post.user.discordId !== user.discordId && !!usersPost
          }
          postRef={post.id === getIdToScrollTo() ? postRef : undefined}
          showXp={state.xp}
          showPlusServerMembership={state.plusServer}
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

export const getStaticProps: GetStaticProps = async () => {
  const posts = await freeAgentsService.posts();

  return {
    props: {
      postsInitialData: serializeDataForGetStaticProps(posts),
    },
    revalidate: 60,
  };
};

export default FreeAgentsPage;
