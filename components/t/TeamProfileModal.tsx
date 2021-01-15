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
  useToast,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { t, Trans } from "@lingui/macro";
import { useLingui } from "@lingui/react";
import MarkdownTextarea from "components/common/MarkdownTextarea";
import { getToastOptions } from "lib/getToastOptions";
import { sendData } from "lib/postData";
import {
  teamSchema,
  TEAM_BIO_CHARACTER_LIMIT,
  TEAM_RECRUITING_POST_CHARACTER_LIMIT,
} from "lib/validators/team";
import { GetTeamData } from "prisma/queries/getTeam";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { FaTwitter } from "react-icons/fa";
import { FiEdit } from "react-icons/fi";
import { mutate } from "swr";
import * as z from "zod";

interface Props {
  team: NonNullable<GetTeamData>;
}

type FormData = z.infer<typeof teamSchema>;

const TeamProfileModal: React.FC<Props> = ({ team }) => {
  const { i18n } = useLingui();
  const toast = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [sending, setSending] = useState(false);

  const { handleSubmit, errors, register, watch } = useForm<FormData>({
    resolver: zodResolver(teamSchema),
    defaultValues: team,
  });

  const watchBio = watch("bio", team.bio);
  const watchRecruitingPost = watch("recruitingPost", team.recruitingPost);

  const onSubmit = async (formData: FormData) => {
    setSending(true);

    const success = await sendData("PUT", "/api/teams", formData);
    setSending(false);
    if (!success) return;

    mutate(`/api/teams/${team.id}`);

    toast(getToastOptions(t`Team profile updated`, "success"));

    setIsOpen(false);
  };

  return (
    <>
      <Button leftIcon={<FiEdit />} onClick={() => setIsOpen(true)} size="sm">
        <Trans>Edit team profile</Trans>
      </Button>
      {isOpen && (
        <Modal
          isOpen
          onClose={() => setIsOpen(false)}
          size="xl"
          closeOnOverlayClick={false}
        >
          <ModalOverlay>
            <ModalContent>
              <ModalHeader>
                <Trans>Editing team profile</Trans>
              </ModalHeader>
              <ModalCloseButton borderRadius="50%" />
              <form onSubmit={handleSubmit(onSubmit)}>
                <ModalBody pb={6}>
                  <FormControl isInvalid={!!errors.twitterName}>
                    <FormLabel htmlFor="twitterName">
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
                        placeholder="olivesplatoon"
                      />
                    </InputGroup>
                    <FormHelperText>
                      <Trans>
                        Twitter is also used to get the team's avatar.
                      </Trans>
                    </FormHelperText>
                    <FormErrorMessage>
                      {errors.twitterName?.message}
                    </FormErrorMessage>
                  </FormControl>

                  <MarkdownTextarea
                    fieldName="bio"
                    title={i18n._(t`Bio`)}
                    error={errors.bio}
                    register={register}
                    value={watchBio ?? ""}
                    maxLength={TEAM_BIO_CHARACTER_LIMIT}
                    placeholder={i18n._(
                      t`# I'm a header
                  I'm **bolded**. Embedding weapon images is easy too: :luna_blaster:`
                    )}
                  />

                  <MarkdownTextarea
                    fieldName="recruitingPost"
                    title={i18n._(t`Recruiting post`)}
                    error={errors.recruitingPost}
                    register={register}
                    value={watchRecruitingPost ?? ""}
                    maxLength={TEAM_RECRUITING_POST_CHARACTER_LIMIT}
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
                  <Button onClick={() => setIsOpen(false)} variant="outline">
                    <Trans>Cancel</Trans>
                  </Button>
                </ModalFooter>
              </form>
            </ModalContent>
          </ModalOverlay>
        </Modal>
      )}
    </>
  );
};

export default TeamProfileModal;
