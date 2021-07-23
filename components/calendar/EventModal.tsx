import { Button } from "@chakra-ui/button";
import {
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
} from "@chakra-ui/form-control";
import { Input } from "@chakra-ui/input";
import { Box } from "@chakra-ui/layout";
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/modal";
import { Select } from "@chakra-ui/select";
import { useToast } from "@chakra-ui/toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { t, Trans } from "@lingui/macro";
import { useLingui } from "@lingui/react";
import DatePicker from "components/common/DatePicker";
import MarkdownTextarea from "components/common/MarkdownTextarea";
import { CSSVariables } from "utils/CSSVariables";
import { Controller, useForm } from "react-hook-form";
import { FiTrash } from "react-icons/fi";
import { EVENT_FORMATS } from "utils/constants";
import { getToastOptions } from "utils/objects";
import { trpc } from "utils/trpc";
import { eventSchema, EVENT_DESCRIPTION_LIMIT } from "utils/validators/event";
import * as z from "zod";
import TagsSelector from "./TagsSelector";

export type FormData = z.infer<typeof eventSchema>;

export function EventModal({
  onClose,
  event,
  refetchQuery,
}: {
  onClose: () => void;
  event?: { id: number } & FormData;
  refetchQuery: () => void;
}) {
  const toast = useToast();
  const { i18n } = useLingui();
  const { handleSubmit, errors, register, watch, control } = useForm<FormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: event,
  });

  const addEventMutation = trpc.useMutation("calendar.addEvent", {
    onSuccess() {
      toast(getToastOptions(t`Event added`, "success"));
      refetchQuery();
      onClose();
    },
    onError(error) {
      toast(getToastOptions(error.message, "error"));
    },
  });
  const editEventMutation = trpc.useMutation("calendar.editEvent", {
    onSuccess() {
      toast(getToastOptions(t`Event updated`, "success"));
      refetchQuery();
      onClose();
    },
    onError(error) {
      toast(getToastOptions(error.message, "error"));
    },
  });
  const deleteEventMutation = trpc.useMutation("calendar.deleteEvent", {
    onSuccess() {
      toast(getToastOptions(t`Event deleted`, "success"));
      refetchQuery();
      onClose();
    },
    onError(error) {
      toast(getToastOptions(error.message, "error"));
    },
  });

  const watchDescription = watch("description", event?.description ?? "");

  const onSubmit = async (values: FormData) => {
    event
      ? editEventMutation.mutate({ event: values, eventId: event.id })
      : addEventMutation.mutate(values);
  };

  const onDelete = (eventId: number) => deleteEventMutation.mutate({ eventId });

  const defaultDate = new Date();
  defaultDate.setHours(defaultDate.getHours() + 1, 0);

  return (
    <Modal isOpen onClose={onClose} size="xl" closeOnOverlayClick={false}>
      <ModalOverlay>
        <ModalContent>
          <ModalHeader>
            {event ? (
              <Trans>Editing event</Trans>
            ) : (
              <Trans>Adding a new event</Trans>
            )}
          </ModalHeader>
          <ModalCloseButton borderRadius="50%" />
          <form onSubmit={handleSubmit(onSubmit)}>
            <ModalBody pb={6}>
              {event && (
                <Button
                  leftIcon={<FiTrash />}
                  variant="outline"
                  color="red.500"
                  mb={6}
                  isLoading={deleteEventMutation.isLoading}
                  onClick={async () => {
                    if (window.confirm(t`Delete the event?`))
                      onDelete(event.id);
                  }}
                  data-cy="delete-button"
                >
                  <Trans>Delete event</Trans>
                </Button>
              )}

              <Box fontSize="sm" color={CSSVariables.themeGray} mb={4}>
                <Trans>
                  Add upcoming Splatoon events you are hosting to the calendar.
                </Trans>
              </Box>

              {/* <FormLabel htmlFor="isTournament">
                <Trans>Type</Trans>
              </FormLabel>

              <RadioGroup name="isTournament" ref={register}>
                <Stack direction="row">
                  <Radio value="1">
                    <Trans>Tournament</Trans>
                  </Radio>
                  <Radio value="2">
                    <Trans>Other</Trans>
                  </Radio>
                </Stack>
              </RadioGroup> */}

              <FormControl isInvalid={!!errors.name}>
                <FormLabel htmlFor="name">
                  <Trans>Name</Trans>
                </FormLabel>
                <Input
                  name="name"
                  ref={register}
                  placeholder="In The Zone X"
                  data-cy="name-input"
                />
                <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.date}>
                <FormLabel htmlFor="date" mt={4}>
                  <Trans>Date</Trans>
                </FormLabel>
                <Controller
                  name="date"
                  control={control}
                  defaultValue={defaultDate.toISOString()}
                  render={({ onChange, value }) => (
                    // <Input
                    //   type="datetime-local"
                    //   value={value.substring(0, 16)}
                    //   onChange={onChange}
                    //   min={defaultIsoDateTime}
                    // />
                    <DatePicker
                      selectedDate={new Date(value)}
                      onChange={(d) => onChange(d.toString())}
                    />
                  )}
                />
                <FormHelperText>
                  <Trans>Input the time in your local time zone:</Trans>{" "}
                  {Intl.DateTimeFormat().resolvedOptions().timeZone}
                </FormHelperText>
                <FormErrorMessage>{errors.date?.message}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.discordInviteUrl}>
                <FormLabel htmlFor="discordInviteUrl" mt={4}>
                  <Trans>Discord invite URL</Trans>
                </FormLabel>
                <Input
                  name="discordInviteUrl"
                  ref={register}
                  placeholder="https://discord.gg/9KJKn29D"
                  data-cy="discord-invite-url-input"
                />
                <FormErrorMessage>
                  {errors.discordInviteUrl?.message}
                </FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.eventUrl}>
                <FormLabel htmlFor="eventUrl" mt={4}>
                  <Trans>Registration URL</Trans>
                </FormLabel>
                <Input
                  name="eventUrl"
                  ref={register}
                  placeholder="https://challonge.com/tournaments/signup/Javco7YsUX"
                  data-cy="registration-url-input"
                />
                <FormErrorMessage>{errors.eventUrl?.message}</FormErrorMessage>
              </FormControl>

              <FormControl>
                <FormLabel htmlFor="format" mt={4}>
                  <Trans>Format</Trans>
                </FormLabel>

                <Select name="format" ref={register}>
                  {EVENT_FORMATS.map((format) => (
                    <option key={format.code} value={format.code}>
                      {format.name}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <MarkdownTextarea
                fieldName="description"
                title={i18n._(t`Description`)}
                error={errors.description}
                register={register}
                value={watchDescription ?? ""}
                maxLength={EVENT_DESCRIPTION_LIMIT}
                placeholder={i18n._(
                  t`# Header
                  All the relevant info about tournament goes here. We can even use **bolding**.`
                )}
                dataCy="description-markdown"
              />

              <FormControl>
                <FormLabel htmlFor="tags" mt={4}>
                  <Trans>Tags</Trans>
                </FormLabel>
                <Controller
                  name="tags"
                  control={control}
                  defaultValue={[]}
                  render={({ onChange, value }) => (
                    <TagsSelector value={value} setValue={onChange} />
                  )}
                />
              </FormControl>
            </ModalBody>

            <ModalFooter>
              <Button
                mr={3}
                type="submit"
                isLoading={
                  addEventMutation.isLoading || editEventMutation.isLoading
                }
                data-cy="save-button"
              >
                <Trans>Save</Trans>
              </Button>
              <Button
                onClick={onClose}
                variant="outline"
                isDisabled={
                  addEventMutation.isLoading || editEventMutation.isLoading
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
}
