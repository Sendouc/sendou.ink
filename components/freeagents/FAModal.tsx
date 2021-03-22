import {
  Button,
  Checkbox,
  CheckboxGroup,
  FormControl,
  FormErrorMessage,
  FormHelperText,
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
import MarkdownTextarea from "components/common/MarkdownTextarea";
import { GetAllFreeAgentPostsData } from "prisma/queries/getAllFreeAgentPosts";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { FiTrash } from "react-icons/fi";
import { mutate } from "swr";
import { getToastOptions } from "utils/getToastOptions";
import { sendData } from "utils/postData";
import { Unpacked } from "utils/types";
import {
  FA_POST_CONTENT_LIMIT,
  freeAgentPostSchema,
} from "utils/validators/fapost";
import * as z from "zod";

interface Props {
  onClose: () => void;
  post?: Unpacked<GetAllFreeAgentPostsData>;
}

type FormData = z.infer<typeof freeAgentPostSchema>;

const FAModal: React.FC<Props> = ({ onClose, post }) => {
  const [sending, setSending] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { handleSubmit, errors, register, watch, control } = useForm<FormData>({
    resolver: zodResolver(freeAgentPostSchema),
    defaultValues: post,
  });

  const toast = useToast();

  const watchContent = watch("content", ""); // TODO: get initial fa content from props

  const onSubmit = async (formData: FormData) => {
    setSending(true);

    const success = await sendData("PUT", "/api/freeagents", formData);
    setSending(false);
    if (!success) return;

    mutate("/api/freeagents");

    toast(
      getToastOptions(
        post ? t`Free agent post updated` : t`Free agent post submitted`,
        "success"
      )
    );
    onClose();
  };

  const onDelete = async () => {
    setDeleting(true);

    const success = await sendData("DELETE", "/api/freeagents");
    setDeleting(false);
    if (!success) return;

    mutate("/api/freeagents");

    toast(getToastOptions(t`Free agent post deleted`, "success"));
    onClose();
  };

  return (
    <Modal isOpen onClose={onClose} size="xl" closeOnOverlayClick={false}>
      <ModalOverlay>
        <ModalContent>
          <ModalHeader>
            {post ? (
              <Trans>Editing free agent post</Trans>
            ) : (
              <Trans>Submitting a new free agent post</Trans>
            )}
          </ModalHeader>
          <ModalCloseButton borderRadius="50%" />
          <form onSubmit={handleSubmit(onSubmit)}>
            <ModalBody pb={6}>
              {post && (
                <>
                  <Button
                    leftIcon={<FiTrash />}
                    variant="outline"
                    color="red.500"
                    isLoading={deleting}
                    onClick={async () => {
                      if (window.confirm(t`Delete the free agent post?`))
                        await onDelete();
                    }}
                  >
                    <Trans>Delete free agent post</Trans>
                  </Button>
                  <FormControl>
                    <FormHelperText mb={6}>
                      <Trans>
                        Please note deleting your free agent post also deletes
                        all the likes you have given and received.
                      </Trans>
                    </FormHelperText>
                  </FormControl>
                </>
              )}
              <FormLabel htmlFor="playstyles">
                <Trans>Roles</Trans>
              </FormLabel>

              <FormControl isInvalid={!!errors.playstyles}>
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
                <FormErrorMessage>
                  {/* @ts-ignore */}
                  {errors.playstyles?.message}
                </FormErrorMessage>
              </FormControl>

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
