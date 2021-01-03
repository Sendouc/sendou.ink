import { Box, Button, Divider } from "@chakra-ui/react";
import { t, Trans } from "@lingui/macro";
import Breadcrumbs from "components/common/Breadcrumbs";
import Markdown from "components/common/Markdown";
import MyContainer from "components/common/MyContainer";
import SubText from "components/common/SubText";
import UserAvatar from "components/common/UserAvatar";
import FAModal from "components/freeagents/FAModal";
import { useFreeAgents } from "hooks/freeagents";
import { Unpacked } from "lib/types";
import { GetAllFreeAgentPostsData } from "prisma/queries/getAllFreeAgentPosts";
import { useState } from "react";

const FreeAgentsPage = () => {
  const { data, usersPost } = useFreeAgents();
  const [modalIsOpen, setModalIsOpen] = useState(false);

  return (
    <MyContainer>
      {modalIsOpen && <FAModal onClose={() => setModalIsOpen(false)} />}
      <Breadcrumbs pages={[{ name: t`Free Agents` }]} />
      <Button onClick={() => setModalIsOpen(true)}>
        <Trans>New free agent post</Trans>
      </Button>
      {[...data, ...data, ...data].map((post) => (
        <FreeAgentCard post={post} />
      ))}
    </MyContainer>
  );
};

const FreeAgentCard = ({
  post,
}: {
  post: Unpacked<GetAllFreeAgentPostsData>;
}) => {
  const [showBio, setShowBio] = useState(true);
  return (
    <>
      <Box my={8}>
        <UserAvatar size="xl" user={post.user} />
        <SubText mt={4}>
          <Trans>Free agent post</Trans>
        </SubText>
        <Markdown value={post.content} smallHeaders />
        {post.user.profile?.bio && (
          <Button onClick={() => setShowBio(!showBio)}>
            {showBio ? <Trans>Hide bio</Trans> : <Trans>Show bio</Trans>}
          </Button>
        )}
        {showBio && post.user.profile?.bio && (
          <>
            <SubText mt={4}>
              <Trans>Bio</Trans>
            </SubText>
            <Markdown value={post.user.profile.bio} smallHeaders />
          </>
        )}
      </Box>
      <Divider />
    </>
  );
};

export default FreeAgentsPage;
