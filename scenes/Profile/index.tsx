import { Box, Button } from "@chakra-ui/core";
import { GetUserByIdentifierQuery } from "generated/graphql";
import Markdown from "lib/components/Markdown";
import MyHead from "lib/components/MyHead";
import { useTranslation } from "lib/useMockT";
import useUser from "lib/useUser";
import { useState } from "react";
import AvatarWithInfo from "./components/AvatarWithInfo";
import ProfileModal from "./components/ProfileModal";

interface Props {
  user: NonNullable<GetUserByIdentifierQuery["getUserByIdentifier"]>;
  identifier: string;
}

const Profile: React.FC<Props> = ({ user, identifier }) => {
  const { t } = useTranslation();
  const [showModal, setShowModal] = useState(false);
  const [loggedInUser] = useUser();
  return (
    <>
      <MyHead title={user.fullUsername} />
      <AvatarWithInfo user={user} />
      {loggedInUser?.id === user.id && (
        <Button onClick={() => setShowModal(true)}>
          {t("users;Edit profile")}
        </Button>
      )}
      {showModal && (
        <ProfileModal
          onClose={() => setShowModal(false)}
          existingProfile={user.profile}
          identifier={identifier}
        />
      )}
      {user.profile?.bio && (
        <Box my="2em">
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
