import {
  Button,
  Checkbox,
  CheckboxGroup,
  FormLabel,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Radio,
  RadioGroup,
  Stack,
  useToast,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { t, Trans } from "@lingui/macro";
import { useLingui } from "@lingui/react";
import MarkdownTextarea from "components/common/MarkdownTextarea";
import {
  FA_POST_CONTENT_LIMIT,
  freeAgentPostSchema,
} from "lib/validators/fapost";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";

interface Props {
  onClose: () => void;
}

type FormData = z.infer<typeof freeAgentPostSchema>;

const FAModal: React.FC<Props> = ({ onClose }) => {
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

  const toast = useToast();

  const watchContent = watch("content", ""); // TODO: get initial fa content from props

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
            <ModalBody pb={6}>
              <FormLabel htmlFor="playstyles">
                <Trans>Roles</Trans>
              </FormLabel>
              <Controller
                name="playstyles"
                control={control}
                defaultValue={[]}
                render={({ onChange, value }) => (
                  <CheckboxGroup value={value} onChange={onChange}>
                    <HStack>
                      <Checkbox value="FRONTLINE">
                        <Trans>Frontline</Trans>
                      </Checkbox>
                      <Checkbox value="MIDLINE">
                        <Trans>Support</Trans>
                      </Checkbox>
                      <Checkbox value="BACKLINE">
                        <Trans>Backline</Trans>
                      </Checkbox>
                    </HStack>
                  </CheckboxGroup>
                )}
              />

              <FormLabel htmlFor="canVC" mt={4}>
                <Trans>Can you voice chat?</Trans>
              </FormLabel>
              <Controller
                name="canVC"
                control={control}
                defaultValue="YES"
                render={({ onChange, value }) => (
                  <RadioGroup value={value} onChange={onChange}>
                    <Stack direction="row">
                      <Radio value="YES">Yes</Radio>
                      <Radio value="MAYBE">Sometimes</Radio>
                      <Radio value="NO">No</Radio>
                    </Stack>
                  </RadioGroup>
                )}
              />

              <MarkdownTextarea
                fieldName="content"
                title={t`Post`}
                error={errors.content}
                register={register}
                value={watchContent ?? ""}
                maxLength={FA_POST_CONTENT_LIMIT}
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

export default FAModal;
