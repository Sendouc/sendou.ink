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
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { t, Trans } from "@lingui/macro";
import { useLingui } from "@lingui/react";
import ChakraSelect from "components/common/ChakraSelect";
import MarkdownTextarea from "components/common/MarkdownTextarea";
import WeaponSelector from "components/common/WeaponSelector";
import { countries } from "countries-list";
import { GetUserByIdentifierData } from "prisma/queries/getUserByIdentifier";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { FaGamepad, FaTwitch, FaTwitter, FaYoutube } from "react-icons/fa";
import { mutate } from "swr";
import { getToastOptions } from "utils/getToastOptions";
import { sendData } from "utils/postData";
import {
  profileSchemaFrontend,
  PROFILE_CHARACTER_LIMIT,
} from "utils/validators/profile";
import * as z from "zod";

const sensOptions = [
  "-5",
  "-4.5",
  "-4",
  "-3.5",
  "-3",
  "-2.5",
  "-2",
  "-1.5",
  "-1",
  "-0.5",
  "0",
  "+0.5",
  "+1",
  "+1.5",
  "+2",
  "+2.5",
  "+3",
  "+3.5",
  "+4",
  "+4.5",
  "+5",
];

const sensToString = (sens: number | undefined | null) => {
  if (sens === undefined || sens === null) return "";

  return sens > 0 ? `+${sens}` : `${sens}`;
};

interface Props {
  onClose: () => void;
  user: NonNullable<GetUserByIdentifierData>;
}

type FormData = z.infer<typeof profileSchemaFrontend>;

const ProfileModal: React.FC<Props> = ({ onClose, user }) => {
  const [sending, setSending] = useState(false);
  const { i18n } = useLingui();

  const { handleSubmit, errors, register, watch, control } = useForm<FormData>({
    resolver: zodResolver(profileSchemaFrontend),
    defaultValues: user?.profile
      ? {
          ...user.profile,
          sensMotion: sensToString(user.profile.sensMotion),
          sensStick: sensToString(user.profile.sensStick),
        }
      : {
          sensStick: "",
          sensMotion: "",
        },
  });

  const watchBio = watch("bio", user.profile?.bio);

  const toast = useToast();

  const onSubmit = async (formData: FormData) => {
    setSending(true);
    const mutationData = {
      ...formData,
      // sens is treated as string on the frontend side of things because
      // html select uses strings
      sensStick:
        typeof formData.sensStick === "string"
          ? parseFloat(formData.sensStick)
          : null,
      sensMotion:
        typeof formData.sensMotion === "string"
          ? parseFloat(formData.sensMotion)
          : null,
    };

    for (const [key, value] of Object.entries(mutationData)) {
      if (value === "" || value === undefined) {
        const typedKey = key as keyof Omit<typeof mutationData, "weaponPool">;
        mutationData[typedKey] = null;
      }
    }

    const success = await sendData("PUT", "/api/me/profile", mutationData);
    setSending(false);
    if (!success) return;

    mutate(`/api/users/${user.id}`);

    toast(getToastOptions(i18n._(t`Profile updated`), "success"));
    onClose();
  };

  return (
    <Modal isOpen onClose={onClose} size="xl" closeOnOverlayClick={false}>
      <ModalOverlay>
        <ModalContent>
          <ModalHeader>
            <Trans>Editing profile</Trans>
          </ModalHeader>
          <ModalCloseButton borderRadius="50%" />
          <form onSubmit={handleSubmit(onSubmit)}>
            <ModalBody pb={6}>
              <FormControl isInvalid={!!errors.customUrlPath}>
                <FormLabel htmlFor="customUrlPath">
                  <Trans>Custom URL</Trans>
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
                  <Trans>Twitter name</Trans>
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
                  <Trans>Twitch name</Trans>
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
                  <Trans>YouTube channel ID</Trans>
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

              <FormControl>
                <FormLabel htmlFor="country" mt={4}>
                  <Trans>Country</Trans>
                </FormLabel>
                <Controller
                  name="country"
                  control={control}
                  defaultValue={""}
                  render={({ onChange, value }) => (
                    <ChakraSelect
                      value={value}
                      setValue={onChange}
                      placeholder={t`Select country`}
                    >
                      {(Object.keys(countries) as Array<keyof typeof countries>)
                        .sort((a, b) =>
                          countries[a].name.localeCompare(countries[b].name)
                        )
                        .map((countryCode) => (
                          <option key={countryCode} value={countryCode}>
                            {countries[countryCode].name}
                          </option>
                        ))}
                    </ChakraSelect>
                  )}
                />
              </FormControl>

              <FormControl>
                <FormLabel htmlFor="weaponPool" mt={4}>
                  <Trans>Weapon pool</Trans>
                </FormLabel>
                <Controller
                  name="weaponPool"
                  control={control}
                  defaultValue={[]}
                  render={({ onChange, value }) => (
                    <WeaponSelector
                      value={value}
                      setValue={onChange}
                      isMulti
                      pool="WITH_ALTS"
                      maxMultiCount={5}
                    />
                  )}
                />
              </FormControl>

              <FormControl>
                <FormLabel htmlFor="sensStick" mt={4}>
                  <Box as={FaGamepad} display="inline-block" mr={2} mb={1} />
                  <Trans>Stick sensitivity</Trans>
                </FormLabel>
                <Controller
                  name="sensStick"
                  control={control}
                  render={({ onChange, value, name }) => (
                    <ChakraSelect
                      placeholder={t`Select stick sensitivity`}
                      name={name}
                      value={value}
                      setValue={onChange}
                    >
                      {sensOptions.map((sens) => (
                        <option key={sens} value={sens}>
                          {sens}
                        </option>
                      ))}
                    </ChakraSelect>
                  )}
                />
              </FormControl>

              <FormControl>
                <FormLabel htmlFor="sensMotion" mt={4}>
                  <Box as={FaGamepad} display="inline-block" mr={2} mb={1} />
                  <Trans>Motion sensitivity</Trans>
                </FormLabel>
                <Controller
                  name="sensMotion"
                  control={control}
                  render={({ onChange, value, name }) => (
                    <ChakraSelect
                      placeholder={t`Select motion sensitivity`}
                      name={name}
                      value={value}
                      setValue={onChange}
                    >
                      {sensOptions.map((sens) => (
                        <option key={sens} value={sens}>
                          {sens}
                        </option>
                      ))}
                    </ChakraSelect>
                  )}
                />
              </FormControl>

              <MarkdownTextarea
                fieldName="bio"
                title={i18n._(t`Bio`)}
                error={errors.bio}
                register={register}
                value={watchBio ?? ""}
                maxLength={PROFILE_CHARACTER_LIMIT}
                placeholder={i18n._(
                  t`# I'm a header
                  I'm **bolded**. Embedding weapon images is easy too: :luna_blaster:`
                )}
              />
            </ModalBody>
            <ModalFooter>
              <Button mr={3} type="submit" isLoading={sending}>
                <Trans>Save</Trans>
              </Button>
              <Button onClick={onClose} variant="outline">
                <Trans>Cancel</Trans>
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </ModalOverlay>
    </Modal>
  );
};

export default ProfileModal;
