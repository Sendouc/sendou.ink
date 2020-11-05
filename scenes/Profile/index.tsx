import { Box, Button, Divider } from "@chakra-ui/core";
import { t, Trans } from "@lingui/macro";
import Breadcrumbs from "components/Breadcrumbs";
import Markdown from "components/Markdown";
import { GetUserByIdentifierQuery } from "generated/graphql";
import useUser from "lib/useUser";
import { useState } from "react";
import AvatarWithInfo from "./components/AvatarWithInfo";
import ProfileModal from "./components/ProfileModal";

interface Props {
  user: NonNullable<GetUserByIdentifierQuery["getUserByIdentifier"]>;
  identifier: string;
}

const Profile: React.FC<Props> = ({ user, identifier }) => {
  const [showModal, setShowModal] = useState(false);
  const [loggedInUser] = useUser();
  return (
    <>
      <Breadcrumbs
        pages={[{ name: t`Users`, link: "/u" }, { name: user.fullUsername }]}
      />
      <AvatarWithInfo user={user} />
      {loggedInUser?.id === user.id && (
        <Button onClick={() => setShowModal(true)}>
          <Trans>Edit profile</Trans>
        </Button>
      )}
      {showModal && (
        <ProfileModal
          onClose={() => setShowModal(false)}
          existingProfile={user.profile}
          identifier={identifier}
        />
      )}
      <Divider my="2em" />
      {user.profile?.bio && (
        <Box>
          <Markdown value={user.profile.bio} />
        </Box>
      )}
      {/*FIXME:
      <Tabs isFitted variant="line" mt="2em" colorScheme={themeColor}>
        <TabList mb="1em">
          {tabs.map((tabObj) => (
            <Tab key={tabObj.id} color={textColor}>
              <Box
                as={tabObj.icon}
                size="24px"
                color={themeColorWithShade}
                mr="7px"
              />{" "}
              {tabObj.title}
            </Tab>
          ))}
        </TabList>
        <TabPanels>{tabs.map((tabObj) => tabObj.content)}</TabPanels>
          </Tabs>*/}
    </>
  );
};

export default Profile;
