import { useMutation } from "@apollo/client"
import {
  Box,
  Flex,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  Image,
  useToast,
} from "@chakra-ui/core"
import React, { useState } from "react"
import {
  DeleteCompetitiveFeedEventVars,
  DELETE_COMPETITIVE_FEED_EVENT,
} from "../../graphql/mutations/deleteCompetitiveFeedEvent"
import {
  UpdateCompetitiveFeedEventVars,
  UPDATE_COMPETITIVE_FEED_EVENT,
} from "../../graphql/mutations/updateCompetitiveFeedEvent"
import {
  CompetitiveFeedEvent,
  UPCOMING_EVENTS,
} from "../../graphql/queries/upcomingEvents"
import Button from "../elements/Button"
import DatePicker from "../elements/DatePicker"
import Input from "../elements/Input"
import Label from "../elements/Label"
import Modal from "../elements/Modal"
import MarkdownInput from "../user/MarkdownInput"

interface TournamentModalProps {
  closeModal: () => void
  competitiveFeedEvent: CompetitiveFeedEvent
}

const TournamentModal: React.FC<TournamentModalProps> = ({
  closeModal,
  competitiveFeedEvent,
}) => {
  const [event, setEvent] = useState<CompetitiveFeedEvent>(competitiveFeedEvent)
  const [showErrors, setShowErrors] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const toast = useToast()

  const [updateCompetitiveFeedEvent, { loading }] = useMutation<
    boolean,
    UpdateCompetitiveFeedEventVars
  >(UPDATE_COMPETITIVE_FEED_EVENT, {
    variables: {
      ...({
        event: {
          name: event.name,
          date: event.date,
          description: event.description,
          message_discord_id: event.message_discord_id,
          discord_invite_url: event.discord_invite_url,
          picture_url: event.picture_url,
        },
      } as UpdateCompetitiveFeedEventVars),
    },
    onCompleted: () => {
      closeModal()
      toast({
        description: `Event updated`,
        position: "top-right",
        status: "success",
        duration: 10000,
      })
    },
    onError: (error) => {
      toast({
        title: "An error occurred",
        description: error.message,
        position: "top-right",
        status: "error",
        duration: 10000,
      })
    },
    refetchQueries: [{ query: UPCOMING_EVENTS }],
  })

  const [deleteCompetitiveFeedEvent, { loading: deleteLoading }] = useMutation<
    boolean,
    DeleteCompetitiveFeedEventVars
  >(DELETE_COMPETITIVE_FEED_EVENT, {
    variables: { message_discord_id: event.message_discord_id },
    onCompleted: (data) => {
      closeModal()
      toast({
        description: `Event deleted`,
        position: "top-right",
        status: "success",
        duration: 10000,
      })
    },
    onError: (error) => {
      toast({
        title: "An error occurred",
        description: error.message,
        position: "top-right",
        status: "error",
        duration: 10000,
      })
    },
    refetchQueries: [{ query: UPCOMING_EVENTS }],
  })

  const handleChange = (newValueObject: Partial<CompetitiveFeedEvent>) => {
    setEvent({ ...event, ...newValueObject })
  }

  const date = new Date(parseInt(event.date))
  const dateNow = new Date()

  const handleSubmit = () => {
    if (
      !event.name ||
      event.name.length > 200 ||
      date.getTime() < dateNow.getTime() ||
      !event.discord_invite_url.includes("https://discord.gg/") ||
      !event.description ||
      event.description.length > 3000
    ) {
      setShowErrors(true)
      return
    }

    updateCompetitiveFeedEvent()
  }

  return (
    <Modal title="Editing upcoming event info" closeModal={closeModal}>
      <Box
        color="red.500"
        mb="1em"
        textDecoration="underline"
        cursor="pointer"
        onClick={() => setDeleting(true)}
      >
        Delete event
      </Box>
      {deleting && (
        <>
          <Flex flexWrap="wrap" mt="1em">
            <Box mr="1em">
              <Button
                onClick={() => deleteCompetitiveFeedEvent()}
                loading={deleteLoading}
              >
                Confirm deletion
              </Button>
            </Box>
            <Button outlined onClick={() => setDeleting(false)}>
              Cancel
            </Button>
          </Flex>
        </>
      )}
      <FormControl
        isRequired
        isInvalid={showErrors && (!event.name || event.name.length > 400)}
        mt="1em"
      >
        <Input
          label="Name"
          value={event.name}
          setValue={(value) => handleChange({ name: value })}
        />
        <FormErrorMessage>Event name length invalid</FormErrorMessage>
      </FormControl>

      <FormControl
        isRequired
        isInvalid={showErrors && date.getTime() < dateNow.getTime()}
        mt="1em"
      >
        <Label>Date</Label>
        <DatePicker
          date={date}
          setDate={(newDate) => handleChange({ date: "" + newDate!.getTime() })}
        />
        <FormHelperText>
          Set the time in your local time. Time now: {new Date().toTimeString()}{" "}
        </FormHelperText>
        <FormErrorMessage>Date in the past</FormErrorMessage>
      </FormControl>

      <FormControl
        isRequired
        isInvalid={
          showErrors &&
          !event.discord_invite_url.includes("https://discord.gg/")
        }
        mt="1em"
      >
        <Input
          label="Discord invite"
          value={event.discord_invite_url}
          setValue={(value) => handleChange({ discord_invite_url: value })}
        />
        <FormErrorMessage>Invalid Discord invite</FormErrorMessage>
      </FormControl>

      <FormControl
        isRequired
        isInvalid={
          showErrors && (!event.description || event.description.length > 3000)
        }
        mt="1em"
      >
        <MarkdownInput
          value={event.description}
          setValue={(value) => handleChange({ description: value })}
          label="Description"
        />
        <FormHelperText>
          Markdown is supported. See:{" "}
          <a href="/markdown" target="_blank" rel="noreferrer noopener">
            https://sendou.ink/markdown
          </a>
        </FormHelperText>
        <FormErrorMessage>Description length invalid</FormErrorMessage>
      </FormControl>

      <FormControl isRequired mt="1em">
        <Input
          label="Picture URL"
          value={event.picture_url ?? ""}
          setValue={(value) => handleChange({ picture_url: value })}
        />
        {event.picture_url && (
          <Image mt="1em" borderRadius="5px" src={event.picture_url} />
        )}
      </FormControl>

      <Flex flexWrap="wrap" mt="1em">
        <Box mr="1em">
          <Button
            onClick={() => handleSubmit()}
            loading={loading || deleteLoading}
          >
            Submit
          </Button>
        </Box>
        <Button outlined onClick={() => closeModal()}>
          Cancel
        </Button>
      </Flex>
    </Modal>
  )
}

export default TournamentModal
