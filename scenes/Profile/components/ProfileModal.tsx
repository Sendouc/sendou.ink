import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  InputGroup,
  InputLeftAddon,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useToast,
} from "@chakra-ui/core";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  GetUserByIdentifierQuery,
  UpdateUserProfileInput,
  useUpdateUserProfileMutation,
} from "generated/graphql";
import { getToastOptions } from "lib/getToastOptions";
import { useTranslation } from "lib/useMockT";
import { useForm } from "react-hook-form";
import { FaTwitch, FaTwitter, FaYoutube } from "react-icons/fa";
import { profileSchema } from "validators/profile";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  existingProfile?: NonNullable<
    GetUserByIdentifierQuery["getUserByIdentifier"]
  >["profile"];
}

const ProfileModal: React.FC<Props> = ({
  isOpen,
  onClose,
  existingProfile,
}) => {
  const { t } = useTranslation();

  const { handleSubmit, errors, register } = useForm<UpdateUserProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: existingProfile ?? undefined,
  });

  const toast = useToast();
  const [updateUserProfile] = useUpdateUserProfileMutation({
    onCompleted: () => {
      toast(getToastOptions(t("users;Profile updated"), "success"));
      onClose();
    },
    onError: (error) => {
      toast(getToastOptions(error.message, "error"));
    },
  });

  const onSubmit = async (data: UpdateUserProfileInput) => {
    Object.keys(data).forEach((key) => {
      const typedKey = key as keyof typeof data;
      if (data[typedKey] === "") {
        data[typedKey] = null;
      }
    });

    await updateUserProfile({ variables: { profile: data } });
    console.log(data);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay>
        <ModalContent /*bg={secondaryBgColor}*/>
          <ModalHeader>{t("users;Editing profile")}</ModalHeader>
          <ModalCloseButton />
          <form onSubmit={handleSubmit(onSubmit)}>
            <ModalBody pb={6}>
              <FormControl isInvalid={!!errors.customUrlPath}>
                <FormLabel htmlFor="customUrlPath">
                  {t("users;Custom URL")}
                </FormLabel>
                <InputGroup>
                  <InputLeftAddon children="https://sendou.ink/u/" />
                  <Input
                    name="customUrlPath"
                    ref={register}
                    placeholder="sendou"
                  />
                </InputGroup>
                <FormErrorMessage>
                  {errors.customUrlPath?.message}
                </FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.twitterName}>
                <FormLabel htmlFor="twitterName" mt={4}>
                  <Box
                    as={FaTwitter}
                    display="inline-block"
                    mr={2}
                    mb={1}
                    color="#1DA1F2"
                  />{" "}
                  {t("users;Twitter name")}
                </FormLabel>
                <InputGroup>
                  <InputLeftAddon children="https://twitter.com/" />
                  <Input
                    name="twitterName"
                    ref={register}
                    placeholder="sendouc"
                  />
                </InputGroup>
                <FormErrorMessage>
                  {errors.twitterName?.message}
                </FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.twitchName}>
                <FormLabel htmlFor="twitchName" mt={4}>
                  <Box
                    as={FaTwitch}
                    display="inline-block"
                    mr={2}
                    mb={1}
                    color="#6441A4"
                  />
                  {t("users;Twitch name")}
                </FormLabel>
                <InputGroup>
                  <InputLeftAddon children="https://twitch.tv/" />
                  <Input
                    name="twitchName"
                    ref={register}
                    placeholder="sendou"
                  />
                </InputGroup>
                <FormErrorMessage>
                  {errors.twitchName?.message}
                </FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.youtubeId}>
                <FormLabel htmlFor="youtubeId" mt={4}>
                  <Box
                    as={FaYoutube}
                    display="inline-block"
                    mr={2}
                    mb={1}
                    color="#FF0000"
                  />
                  {t("users;YouTube channel ID")}
                </FormLabel>
                <InputGroup>
                  <InputLeftAddon children="https://youtube.com/channel/" />
                  <Input
                    name="youtubeId"
                    ref={register}
                    placeholder="UCWbJLXByvsfQvTcR4HLPs5Q"
                  />
                </InputGroup>
                <FormErrorMessage>{errors.youtubeId?.message}</FormErrorMessage>
              </FormControl>
            </ModalBody>

            <ModalFooter>
              <Button mr={3} type="submit">
                Save
              </Button>
              <Button onClick={onClose} variant="outline">
                Cancel
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </ModalOverlay>
    </Modal>
  );
};

export default ProfileModal;
