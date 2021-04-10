import { Alert, AlertIcon, Flex, Wrap, WrapItem } from "@chakra-ui/react";
import { Trans } from "@lingui/macro";
import SubText from "components/common/SubText";
import UserAvatar from "components/common/UserAvatar";
import { Unpacked } from "utils/types";
import { PostsData } from "../service";

const MatchesInfo = ({
  matchedPosts,
  focusOnMatch,
}: {
  matchedPosts: (Unpacked<PostsData> | undefined)[];
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

export default MatchesInfo;
