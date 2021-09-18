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
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { t, Trans } from "@lingui/macro";
import MarkdownTextarea from "components/common/MarkdownTextarea";
import { useMutation } from "hooks/common";
import { FreeAgentsGet } from "pages/api/free-agents";
import { Controller, useForm } from "react-hook-form";
import { FiTrash } from "react-icons/fi";
import { Unpacked } from "utils/types";
import {
  FA_POST_CONTENT_LIMIT,
  freeAgentPostSchema,
} from "utils/validators/fapost";
import * as z from "zod";

interface Props {
  onClose: () => void;
  refetchQuery: () => void;
  post?: Unpacked<FreeAgentsGet>;
}

type FreeAgentPostSchemaInput = z.infer<typeof freeAgentPostSchema>;

const FAModal = ({ onClose, post, refetchQuery }: Props) => {
  const { handleSubmit, errors, register, watch, control } =
    useForm<FreeAgentPostSchemaInput>({
      resolver: zodResolver(freeAgentPostSchema),
      defaultValues: post,
    });

  const upsertFreeAgentPostMutation = useMutation<FreeAgentPostSchemaInput>({
    url: "/api/free-agents",
    method: "POST",
    successToastMsg: post
      ? t`Free agent post updated`
      : t`Free agent post submitted`,
    afterSuccess: () => {
      refetchQuery();
      onClose();
    },
  });

  const deleteFreeAgentPostMutation = useMutation<FreeAgentPostSchemaInput>({
    url: "/api/free-agents",
    method: "DELETE",
    successToastMsg: t`Free agent post deleted`,
    afterSuccess: () => {
      refetchQuery();
      onClose();
    },
  });

  const watchContent = watch("content", ""); // TODO: get initial fa content from props

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
          <form
            onSubmit={handleSubmit((data) =>
              upsertFreeAgentPostMutation.mutate(data)
            )}
          >
            <ModalBody pb={6}>
              {post && (
                <>
                  <Button
                    leftIcon={<FiTrash />}
                    variant="outline"
                    color="red.500"
                    isLoading={deleteFreeAgentPostMutation.isMutating}
                    onClick={async () => {
                      if (window.confirm(t`Delete the free agent post?`)) {
                        deleteFreeAgentPostMutation.mutate();
                      }
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

              <FormControl isInvalid={!!errors.playstyles}>
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
                <FormErrorMessage>
                  {/* @ts-ignore */}
                  {errors.playstyles?.message}
                </FormErrorMessage>
              </FormControl>

              <FormControl>
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
              </FormControl>

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
              <Button
                mr={3}
                type="submit"
                isLoading={
                  upsertFreeAgentPostMutation.isMutating ||
                  deleteFreeAgentPostMutation.isMutating
                }
              >
                <Trans>Save</Trans>
              </Button>
              <Button
                onClick={onClose}
                variant="outline"
                isDisabled={
                  upsertFreeAgentPostMutation.isMutating ||
                  deleteFreeAgentPostMutation.isMutating
                }
              >
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
