import React, { useState, useContext } from "react"
import Modal from "../elements/Modal"
import UserSelector from "../common/UserSelector"
import { ADD_SUGGESTION } from "../../graphql/mutations/addSuggestion"
import { ADD_VOUCH } from "../../graphql/mutations/addVouch"
import { useMutation } from "@apollo/react-hooks"
import {
  useToast,
  FormControl,
  FormLabel,
  FormHelperText,
  RadioGroup,
  Radio,
  Flex,
  Box,
  FormErrorMessage,
} from "@chakra-ui/core"
import MyThemeContext from "../../themeContext"
import TextArea from "../elements/TextArea"
import Button from "../elements/Button"
import { SUGGESTIONS } from "../../graphql/queries/suggestions"
import { VOUCHES } from "../../graphql/queries/vouches"
import { USER } from "../../graphql/queries/user"

interface AddSuggestionVars {
  discord_id: string
  region: string
  server: string
  description: string
}

interface AddVouchVars {
  discord_id: string
  region: string
  server: string
}

interface SuggestionVouchModalProps {
  closeModal: () => void
  canSuggest: boolean
  canVouch: boolean
  plusServer: "ONE" | "TWO"
}

const SuggestionVouchModal: React.FC<SuggestionVouchModalProps> = ({
  closeModal,
  canSuggest,
  canVouch,
  plusServer,
}) => {
  const [form, setForm] = useState<Partial<AddSuggestionVars>>({})
  const [actionType, setActionType] = useState<string>(
    !canSuggest ? "VOUCH" : "SUGGEST"
  )
  const [showErrors, setShowErrors] = useState(false)
  const toast = useToast()
  const { themeColor } = useContext(MyThemeContext)

  const [addSuggestion] = useMutation<boolean, AddSuggestionVars>(
    ADD_SUGGESTION,
    {
      variables: { ...(form as AddSuggestionVars) },
      onCompleted: data => {
        closeModal()
        toast({
          description: `Suggestion added`,
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
      refetchQueries: [{ query: SUGGESTIONS }],
    }
  )

  const [addVouch] = useMutation<boolean, AddVouchVars>(ADD_VOUCH, {
    variables: { ...(form as AddVouchVars) },
    onCompleted: data => {
      closeModal()
      toast({
        description: `Player vouched`,
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
    refetchQueries: [{ query: VOUCHES }, { query: USER }],
  })

  const handleChange = (newValueObject: Partial<AddSuggestionVars>) => {
    setForm({ ...form, ...newValueObject })
  }

  const handleSubmit = () => {
    if (!form.discord_id || !form.region || !form.server) {
      setShowErrors(true)
      return
    }
    if (
      (!form.description ||
        (form.description && form.description.length > 1000)) &&
      actionType === "SUGGEST"
    ) {
      setShowErrors(true)
      return
    }

    if (actionType === "SUGGEST") addSuggestion()
    if (actionType === "VOUCH") addVouch()
  }

  return (
    <Modal title={"Suggesting or vouching a player"} closeModal={closeModal}>
      <FormControl isRequired isInvalid={showErrors && !form.discord_id}>
        <FormLabel htmlFor="user">Discord username</FormLabel>
        <UserSelector
          id="user"
          setValue={value => handleChange({ discord_id: value })}
        />
        <FormErrorMessage>Required field</FormErrorMessage>
        <FormHelperText>
          Only people who have logged in to sendou.ink at least once shown
        </FormHelperText>
      </FormControl>

      <FormControl isRequired mt="1em">
        <FormLabel htmlFor="server">Action</FormLabel>
        <RadioGroup
          spacing={5}
          isInline
          onChange={(e, value) => setActionType(value as string)}
          value={actionType}
        >
          <Radio
            variantColor={themeColor}
            value="SUGGEST"
            isDisabled={!canSuggest}
          >
            Suggest
          </Radio>
          <Radio variantColor={themeColor} value="VOUCH" isDisabled={!canVouch}>
            Vouch
          </Radio>
        </RadioGroup>
        <FormHelperText>
          Vouching only possible if you got high enough ratio in the last voting
        </FormHelperText>
      </FormControl>

      <FormControl isRequired isInvalid={showErrors && !form.server} mt="1em">
        <FormLabel htmlFor="server">Server</FormLabel>
        <RadioGroup
          id="server"
          spacing={5}
          isInline
          onChange={(e, value) => handleChange({ server: value as string })}
          value={form.server}
        >
          <Radio
            variantColor={themeColor}
            value="ONE"
            isDisabled={plusServer !== "ONE"}
          >
            +1
          </Radio>
          <Radio variantColor={themeColor} value="TWO">
            +2
          </Radio>
          <FormErrorMessage>Required field</FormErrorMessage>
        </RadioGroup>
      </FormControl>

      <FormControl isRequired isInvalid={showErrors && !form.region} mt="1em">
        <FormLabel htmlFor="region">Region</FormLabel>
        <RadioGroup
          id="region"
          spacing={5}
          isInline
          onChange={(e, value) => handleChange({ region: value as string })}
          value={form.region}
        >
          <Radio
            variantColor={themeColor}
            value="EU"
            isDisabled={plusServer !== "ONE"}
          >
            Europe
          </Radio>
          <Radio variantColor={themeColor} value="NA">
            The Americas
          </Radio>
        </RadioGroup>
        <FormErrorMessage>Required field</FormErrorMessage>
        <FormHelperText>
          If the player doesn't live in either Europe or The Americas you can
          choose the region based on who they are playing more often with
        </FormHelperText>
      </FormControl>

      {actionType === "SUGGEST" && (
        <FormControl
          isRequired
          isInvalid={
            !!(
              (showErrors && !form.description) ||
              (form.description && form.description.length > 1000)
            )
          }
          mt="1em"
        >
          <FormLabel htmlFor="description">Description</FormLabel>
          <TextArea
            id="description"
            setValue={(value: string) =>
              handleChange({ description: value as string })
            }
            value={form.description}
            limit={1000}
          />
          <FormErrorMessage>
            {!form.description
              ? "Required field"
              : "Description can't be more than 1000 characters"}
          </FormErrorMessage>
        </FormControl>
      )}
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

export default SuggestionVouchModal
