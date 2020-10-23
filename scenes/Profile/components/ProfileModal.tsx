import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormHelperText,
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
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Select,
  Textarea,
  useToast,
} from "@chakra-ui/core";
import { zodResolver } from "@hookform/resolvers/zod";
import { countries } from "countries-list";
import {
  GetUserByIdentifierQuery,
  UpdateUserProfileInput,
  useUpdateUserProfileMutation,
} from "generated/graphql";
import { getToastOptions } from "lib/getToastOptions";
import { useTranslation } from "lib/useMockT";
import { useForm } from "react-hook-form";
import { FaGamepad, FaTwitch, FaTwitter, FaYoutube } from "react-icons/fa";
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

  const { handleSubmit, errors, register, watch } = useForm<
    UpdateUserProfileInput
  >({
    resolver: zodResolver(profileSchema),
    defaultValues: existingProfile ?? undefined,
  });

  // FIXME: bio length show
  const watchBio = watch("bio", "");

  const watchSens = watch("stickSens");

  console.log({ watchSens, watchBio });

  console.log({ errors });

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
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      closeOnOverlayClick={false}
    >
      <ModalOverlay>
        <ModalContent>
          <ModalHeader>{t("users;Editing profile")}</ModalHeader>
          <ModalCloseButton borderRadius="50%" />
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

              <FormLabel htmlFor="country" mt={4}>
                {t("users;Country")}
              </FormLabel>
              <Select ref={register} name="country">
                {(Object.keys(countries) as Array<keyof typeof countries>).map(
                  (countryCode) => (
                    <option key={countryCode} value={countryCode}>
                      {countries[countryCode].name}
                    </option>
                  )
                )}
              </Select>

              <FormLabel htmlFor="sensStick" mt={4}>
                <Box as={FaGamepad} display="inline-block" mr={2} mb={1} />
                {t("users;Stick sensitivity")}
              </FormLabel>
              <NumberInput size="lg" step={0.5} min={-5} max={5}>
                <NumberInputField ref={register} name="sensStick" />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>

              <FormLabel htmlFor="sensMotion" mt={4}>
                <Box as={FaGamepad} display="inline-block" mr={2} mb={1} />
                {t("users;Motion sensitivity")}
              </FormLabel>
              <NumberInput size="lg" step={0.5} min={-5} max={5}>
                <NumberInputField ref={register} name="sensMotion" />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>

              <FormControl isInvalid={!!errors.bio}>
                <FormLabel htmlFor="bio" mt={4}>
                  {t("users;Bio")}
                </FormLabel>
                <Textarea
                  ref={register}
                  name="bio"
                  placeholder={`# I'm a header\nI'm **bolded**. Embedding weapon images is easy too: :luna_blaster:`}
                  resize="vertical"
                />
                <FormHelperText>
                  {t("users;markdownPrompt")}{" "}
                  <a href="/markdown" target="_blank" rel="noreferrer noopener">
                    https://sendou.ink/markdown
                  </a>
                </FormHelperText>
                <FormErrorMessage>{errors.bio?.message}</FormErrorMessage>
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
