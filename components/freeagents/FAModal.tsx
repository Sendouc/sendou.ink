import {
  Button,
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useToast,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trans } from "@lingui/macro";
import { useLingui } from "@lingui/react";
import { freeAgentPostSchema } from "lib/validators/fapost";
import { GetUserByIdentifierData } from "prisma/queries/getUserByIdentifier";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

interface Props {
  onClose: () => void;
  user: NonNullable<GetUserByIdentifierData>;
}

type FormData = z.infer<typeof freeAgentPostSchema>;

const FAModal: React.FC<Props> = ({ onClose, user }) => {
  const [sending, setSending] = useState(false);
  const { i18n } = useLingui();

  const { handleSubmit, errors, register, watch, control } = useForm<FormData>({
    resolver: zodResolver(freeAgentPostSchema),
    // defaultValues: user?.profile
    //   ? {
    //       ...user.profile,
    //       sensMotion: sensToString(user.profile.sensMotion),
    //       sensStick: sensToString(user.profile.sensStick),
    //     }
    //   : {
    //       sensStick: "",
    //       sensMotion: "",
    //     },
  });

  const watchBio = watch("bio", user.profile?.bio);

  const toast = useToast();

  // const onSubmit = async (formData: FormData) => {
  //   setSending(true);
  //   const mutationData = {
  //     ...formData,
  //     // sens is treated as string on the frontend side of things because
  //     // html select uses strings
  //     sensStick:
  //       typeof formData.sensStick === "string"
  //         ? parseFloat(formData.sensStick)
  //         : null,
  //     sensMotion:
  //       typeof formData.sensMotion === "string"
  //         ? parseFloat(formData.sensMotion)
  //         : null,
  //   };

  //   for (const [key, value] of Object.entries(mutationData)) {
  //     if (value === "" || value === undefined) {
  //       const typedKey = key as keyof Omit<typeof mutationData, "weaponPool">;
  //       mutationData[typedKey] = null;
  //     }
  //   }

  //   const success = await sendData("PUT", "/api/me/profile", mutationData);
  //   setSending(false);
  //   if (!success) return;

  //   mutate(`/api/users/${user.id}`);

  //   toast(getToastOptions(i18n._(t`Profile updated`), "success"));
  //   onClose();
  // };

  return (
    <Modal isOpen onClose={onClose} size="xl" closeOnOverlayClick={false}>
      <ModalOverlay>
        <ModalContent>
          <ModalHeader>
            <Trans>Editing profile</Trans>
          </ModalHeader>
          <ModalCloseButton borderRadius="50%" />
          {/* <form onSubmit={handleSubmit(onSubmit)}> */}
          <form>
            {/* <ModalBody pb={6}>
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
            </ModalBody> */}
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

export default FAModal;
