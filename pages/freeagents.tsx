import { Box, Button, Divider, Flex } from "@chakra-ui/react";
import { t, Trans } from "@lingui/macro";
import Breadcrumbs from "components/common/Breadcrumbs";
import Markdown from "components/common/Markdown";
import MyContainer from "components/common/MyContainer";
import MyLink from "components/common/MyLink";
import SubText from "components/common/SubText";
import SubTextCollapse from "components/common/SubTextCollapse";
import UserAvatar from "components/common/UserAvatar";
import WeaponImage from "components/common/WeaponImage";
import FAModal from "components/freeagents/FAModal";
import { countries, getEmojiFlag } from "countries-list";
import { useFreeAgents } from "hooks/freeagents";
import { Unpacked } from "lib/types";
import { useMyTheme } from "lib/useMyTheme";
import { GetAllFreeAgentPostsData } from "prisma/queries/getAllFreeAgentPosts";
import { useState } from "react";
import {
  RiAnchorLine,
  RiMicFill,
  RiPaintLine,
  RiSwordLine,
} from "react-icons/ri";

const FreeAgentsPage = () => {
  const { data, usersPost } = useFreeAgents();
  const [modalIsOpen, setModalIsOpen] = useState(false);

  return (
    <MyContainer>
      {modalIsOpen && (
        <FAModal post={usersPost} onClose={() => setModalIsOpen(false)} />
      )}
      <Breadcrumbs pages={[{ name: t`Free Agents` }]} />
      <Button onClick={() => setModalIsOpen(true)}>
        {usersPost ? (
          <Trans>Edit free agent post</Trans>
        ) : (
          <Trans>New free agent post</Trans>
        )}
      </Button>
      {[...data, ...data, ...data].map((post) => (
        <FreeAgentCard post={post} />
      ))}
    </MyContainer>
  );
};

const playstyleToEmoji = {
  FRONTLINE: RiSwordLine,
  MIDLINE: RiPaintLine,
  BACKLINE: RiAnchorLine,
} as const;

const FreeAgentCard = ({
  post,
}: {
  post: Unpacked<GetAllFreeAgentPostsData>;
}) => {
  const { themeColorShade } = useMyTheme();
  return (
    <>
      <Box as="section" my={8}>
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

        {post.user.profile?.weaponPool.length && (
          <Box my={2}>
            {post.user.profile.weaponPool.map((wpn) => (
              <WeaponImage name={wpn} size={32} />
            ))}
          </Box>
        )}

        <Flex mt={4} mb={2}>
          {post.playstyles.map((style) => (
            <Box
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
      </Box>
      <Divider />
    </>
  );
};

export default FreeAgentsPage;
