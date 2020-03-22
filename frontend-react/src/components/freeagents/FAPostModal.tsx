import React, { useState, useContext } from "react"
import Modal from "../elements/Modal"
import { useMutation } from "@apollo/react-hooks"
import {
  useToast,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
  Flex,
  Box,
  FormErrorMessage,
  CheckboxGroup,
  Checkbox,
} from "@chakra-ui/core"
import MyThemeContext from "../../themeContext"
import TextArea from "../elements/TextArea"
import Button from "../elements/Button"
import { FreeAgentPost } from "../../types"
import {
  AddFreeAgentPostVars,
  ADD_FREE_AGENT_POST,
} from "../../graphql/mutations/addFreeAgentPost"
import { FREE_AGENT_POSTS } from "../../graphql/queries/freeAgentPosts"
import { UPDATE_FREE_AGENT_POST } from "../../graphql/mutations/updateFreeAgentPost"
import { HIDE_FREE_AGENT_POST } from "../../graphql/mutations/hideFreeAgentPost"
import Alert from "../elements/Alert"
import { FREE_AGENT_MATCHES } from "../../graphql/queries/freeAgentMatches"

interface FAPostModalProps {
  closeModal: () => void
  post?: FreeAgentPost
}

const FAPostModal: React.FC<FAPostModalProps> = ({ closeModal, post }) => {
  const [form, setForm] = useState<Partial<AddFreeAgentPostVars>>(
    post ? post : {}
  )
  const [showErrors, setShowErrors] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const toast = useToast()
  const { themeColor, grayWithShade } = useContext(MyThemeContext)

  const [addFreeAgentPost] = useMutation<boolean, AddFreeAgentPostVars>(
    ADD_FREE_AGENT_POST,
    {
      variables: { ...(form as AddFreeAgentPostVars) },
      onCompleted: data => {
        closeModal()
        toast({
          description: `Free agent post added`,
          position: "top-right",
          status: "success",
          duration: 10000,
        })
      },
      onError: error => {
        toast({
          title: "An error occurred",
          description: error.message,
          position: "top-right",
          status: "error",
          duration: 10000,
        })
      },
      refetchQueries: [{ query: FREE_AGENT_POSTS }],
    }
  )

  const [editFreeAgentPost] = useMutation<boolean, AddFreeAgentPostVars>(
    UPDATE_FREE_AGENT_POST,
    {
      variables: { ...(form as AddFreeAgentPostVars) },
      onCompleted: data => {
        closeModal()
        toast({
          description: `Free agent post edited`,
          position: "top-right",
          status: "success",
          duration: 10000,
        })
      },
      onError: error => {
        toast({
          title: "An error occurred",
          description: error.message,
          position: "top-right",
          status: "error",
          duration: 10000,
        })
      },
      refetchQueries: [
        { query: FREE_AGENT_POSTS },
        { query: FREE_AGENT_MATCHES },
      ],
    }
  )

  const [hideFreeAgentPost] = useMutation<boolean, AddFreeAgentPostVars>(
    HIDE_FREE_AGENT_POST,
    {
      variables: { ...(form as AddFreeAgentPostVars) },
      onCompleted: data => {
        closeModal()
        toast({
          description: `Free agent post deleted`,
          position: "top-right",
          status: "success",
          duration: 10000,
        })
      },
      onError: error => {
        toast({
          title: "An error occurred",
          description: error.message,
          position: "top-right",
          status: "error",
          duration: 10000,
        })
      },
      refetchQueries: [{ query: FREE_AGENT_POSTS }],
    }
  )

  const handleChange = (newValueObject: Partial<AddFreeAgentPostVars>) => {
    setForm({ ...form, ...newValueObject })
  }

  const actionType = post ? "EDIT" : "NEW"

  const handleSubmit = () => {
    if (
      form.playstyles?.length === 0 ||
      !form.can_vc ||
      (form.past_experience ?? "").length > 100 ||
      (form.activity ?? "").length > 100 ||
      (form.looking_for ?? "").length > 100 ||
      (form.description ?? "").length > 1000
    ) {
      setShowErrors(true)
      return
    }

    if (actionType === "NEW") addFreeAgentPost()
    if (actionType === "EDIT") editFreeAgentPost()
  }

  return (
    <Modal
      title={
        actionType === "NEW"
          ? "Adding a new free agent post"
          : "Editing a free agent post"
      }
      closeModal={closeModal}
    >
      {actionType === "EDIT" && (
        <Box
          color="red.500"
          mb="1em"
          textDecoration="underline"
          cursor="pointer"
          onClick={() => setDeleting(true)}
        >
          Delete free agent post
        </Box>
      )}
      {deleting && (
        <>
          <Box color={grayWithShade}>
            Note that if you decide to delete your post you need to wait a week
            before posting a new one.
          </Box>
          <Flex flexWrap="wrap" mt="1em">
            <Box mr="1em">
              <Button onClick={() => hideFreeAgentPost()}>
                Confirm deletion
              </Button>
            </Box>
            <Button outlined onClick={() => setDeleting(false)}>
              Cancel
            </Button>
          </Flex>
        </>
      )}
      {actionType === "NEW" && (
        <Alert status="info">
          Profile picture, Discord name, Twitter user, weapon pool and Top 500
          history are automatically synced up with your profile. Also please
          note that the post automatically sent to Discord can't be edited
          afterwardsso you want to set these before making a post.
        </Alert>
      )}
      <FormControl
        isRequired
        isInvalid={showErrors && form.playstyles?.length === 0}
        mt="1em"
      >
        <FormLabel htmlFor="playstyles">Playstyles</FormLabel>
        <CheckboxGroup
          id="playstyles"
          variantColor={themeColor}
          value={form.playstyles ?? []}
          onChange={value =>
            handleChange({
              playstyles: value as ("FRONTLINE" | "MIDLINE" | "BACKLINE")[],
            })
          }
        >
          <Checkbox value="FRONTLINE">Frontline/Slayer</Checkbox>
          <Checkbox value="MIDLINE">Midline/Support</Checkbox>
          <Checkbox value="BACKLINE">Backline/Anchor</Checkbox>
        </CheckboxGroup>
        <FormErrorMessage>Required field</FormErrorMessage>
      </FormControl>

      <FormControl isRequired isInvalid={showErrors && !form.can_vc} mt="1em">
        <FormLabel htmlFor="canVc">Can you voice chat?</FormLabel>
        <RadioGroup
          id="canVc"
          variantColor={themeColor}
          value={form.can_vc}
          onChange={(e, value) =>
            handleChange({
              can_vc: value as "YES" | "USUALLY" | "SOMETIMES" | "NO",
            })
          }
        >
          <Radio value="YES">Yes</Radio>
          <Radio value="USUALLY">Usually</Radio>
          <Radio value="SOMETIMES">Sometimes</Radio>
          <Radio value="NO">No</Radio>
        </RadioGroup>
        <FormErrorMessage>Required field</FormErrorMessage>
      </FormControl>

      <FormControl
        isInvalid={
          showErrors &&
          !!form.past_experience &&
          form.past_experience.length > 100
        }
        mt="1em"
      >
        <FormLabel htmlFor="pastExperience">
          Past competitive experience
        </FormLabel>
        <TextArea
          id="pastExperience"
          setValue={(value: string) =>
            handleChange({ past_experience: value as string })
          }
          value={form.past_experience ?? ""}
          limit={100}
        />
        <FormErrorMessage>Value too long</FormErrorMessage>
      </FormControl>

      <FormControl
        isInvalid={showErrors && !!form.activity && form.activity.length > 100}
        mt="1em"
      >
        <FormLabel htmlFor="activity">
          What is your activity like on a typical week?
        </FormLabel>
        <TextArea
          id="activity"
          setValue={(value: string) =>
            handleChange({ activity: value as string })
          }
          value={form.activity ?? ""}
          limit={100}
        />
        <FormErrorMessage>Value too long</FormErrorMessage>
      </FormControl>

      <FormControl
        isInvalid={
          showErrors && !!form.looking_for && form.looking_for.length > 100
        }
        mt="1em"
      >
        <FormLabel htmlFor="lookingFor">
          What are you looking from a team?
        </FormLabel>
        <TextArea
          id="lookingFor"
          setValue={(value: string) =>
            handleChange({ looking_for: value as string })
          }
          value={form.looking_for ?? ""}
          limit={100}
        />
        <FormErrorMessage>Value too long</FormErrorMessage>
      </FormControl>

      <FormControl
        isInvalid={
          showErrors && !!form.description && form.description.length > 1000
        }
        mt="1em"
      >
        <FormLabel htmlFor="lookingFor">Free word</FormLabel>
        <TextArea
          id="lookingFor"
          setValue={(value: string) =>
            handleChange({ description: value as string })
          }
          value={form.description ?? ""}
          height="150px"
          limit={1000}
        />
        <FormErrorMessage>Value too long</FormErrorMessage>
      </FormControl>

      <Flex flexWrap="wrap" mt="1em">
        <Box mr="1em">
          <Button onClick={() => handleSubmit()}>Submit</Button>
        </Box>
        <Button outlined onClick={() => closeModal()}>
          Cancel
        </Button>
      </Flex>
    </Modal>
  )
}

export default FAPostModal
