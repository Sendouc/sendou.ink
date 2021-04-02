import { Button } from "@chakra-ui/button";
import {
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
} from "@chakra-ui/form-control";
import { Input } from "@chakra-ui/input";
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
import MarkdownTextarea from "components/common/MarkdownTextarea";
import { Controller, useForm } from "react-hook-form";
import { FiTrash } from "react-icons/fi";
import { getToastOptions } from "utils/getToastOptions";
import { trpc } from "utils/trpc";
import { eventSchema, EVENT_DESCRIPTION_LIMIT } from "utils/validators/event";
import * as z from "zod";
import { EVENT_FORMATS } from "../utils";
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

  const addEvent = trpc.useMutation("calendar.addEvent", {
    onSuccess() {
      toast(getToastOptions(t`Event added`, "success"));
      refetchQuery();
      onClose();
    },
    onError(error) {
      console.log({ error });
      toast(getToastOptions(error.message, "error"));
    },
  });
  const editEvent = trpc.useMutation("calendar.editEvent", {
    onSuccess() {
      toast(getToastOptions(t`Event updated`, "success"));
      refetchQuery();
      onClose();
    },
    onError(error) {
      console.log({ error });
      toast(getToastOptions(error.message, "error"));
    },
  });
  const deleteEvent = trpc.useMutation("calendar.deleteEvent", {
    onSuccess() {
      toast(getToastOptions(t`Event deleted`, "success"));
      refetchQuery();
      onClose();
    },
    onError(error) {
      console.log({ error });
      toast(getToastOptions(error.message, "error"));
    },
  });

  const watchDescription = watch("description", event?.description ?? "");

  const onSubmit = async (values: FormData) => {
    console.log({ values });
    event
      ? editEvent.mutate({ event: values, eventId: event.id })
      : addEvent.mutate(values);
  };

  const onDelete = (eventId: number) => deleteEvent.mutate({ eventId });

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
                  isLoading={deleteEvent.status === "loading"}
                  onClick={async () => {
                    if (window.confirm(t`Delete the event?`))
                      onDelete(event.id);
                  }}
                >
                  <Trans>Delete event</Trans>
                </Button>
              )}
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

              <FormLabel htmlFor="name">
                <Trans>Name</Trans>
              </FormLabel>

              <FormControl isInvalid={!!errors.name}>
                <Input name="name" ref={register} placeholder="In The Zone X" />
                <FormErrorMessage>{errors.name}</FormErrorMessage>
              </FormControl>

              <FormLabel htmlFor="date" mt={4}>
                <Trans>Date</Trans>
              </FormLabel>

              <FormControl isInvalid={!!errors.date}>
                <Controller
                  name="date"
                  control={control}
                  defaultValue={new Date().toISOString()}
                  render={({ onChange, value }) => (
                    <Input
                      type="datetime-local"
                      value={value.substring(0, 16)}
                      onChange={onChange}
                      min={new Date().toISOString()}
                    />
                  )}
                />
                <FormHelperText>
                  <Trans>Input the time in your local time zone:</Trans>{" "}
                  {Intl.DateTimeFormat().resolvedOptions().timeZone}
                </FormHelperText>
                <FormErrorMessage>{errors.date?.message}</FormErrorMessage>
              </FormControl>

              <FormLabel htmlFor="discordInviteUrl" mt={4}>
                <Trans>Discord invite URL</Trans>
              </FormLabel>

              <FormControl isInvalid={!!errors.discordInviteUrl}>
                <Input
                  name="discordInviteUrl"
                  ref={register}
                  placeholder="https://discord.gg/9KJKn29D"
                />
                <FormErrorMessage>
                  {errors.discordInviteUrl?.message}
                </FormErrorMessage>
              </FormControl>

              <FormLabel htmlFor="eventUrl" mt={4}>
                <Trans>Registration URL</Trans>
              </FormLabel>

              <FormControl isInvalid={!!errors.eventUrl}>
                <Input
                  name="eventUrl"
                  ref={register}
                  placeholder="https://challonge.com/tournaments/signup/Javco7YsUX"
                />
                <FormErrorMessage>{errors.eventUrl?.message}</FormErrorMessage>
              </FormControl>

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
              />

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
            </ModalBody>

            <ModalFooter>
              <Button
                mr={3}
                type="submit"
                isLoading={
                  addEvent.status === "loading" ||
                  editEvent.status === "loading"
                }
              >
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
}
