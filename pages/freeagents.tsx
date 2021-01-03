import { Box, Button, Divider } from "@chakra-ui/react";
import { t, Trans } from "@lingui/macro";
import Breadcrumbs from "components/common/Breadcrumbs";
import Markdown from "components/common/Markdown";
import MyContainer from "components/common/MyContainer";
import SubTextCollapse from "components/common/SubTextCollapse";
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
  return (
    <>
      <Box my={8}>
        <UserAvatar size="xl" user={post.user} />
        <SubTextCollapse title={t`Free agent post`} isOpenByDefault mt={4}>
          <Markdown value={post.content} smallHeaders />
        </SubTextCollapse>
        {post.user.profile?.bio && (
          <SubTextCollapse title={t`Bio`} mt={4}>
            <Markdown value={post.user.profile.bio} smallHeaders />
          </SubTextCollapse>
        )}
      </Box>
      <Divider />
    </>
  );
};

export default FreeAgentsPage;
