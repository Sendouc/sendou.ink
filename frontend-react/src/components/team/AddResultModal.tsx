import React, { useState, useEffect } from "react"
import Modal from "../elements/Modal"
import Box from "../elements/Box"
import { TournamentResult } from "../../types"
import Input from "../elements/Input"
import { useMutation } from "@apollo/react-hooks"
import { useToast } from "@chakra-ui/core"
import { ADD_RESULT } from "../../graphql/mutations/addResult"
import TweetEmbed from "react-tweet-embed"
import DatePicker from "../elements/DatePicker"
import Label from "../elements/Label"
import PlacementInput from "./PlacementInput"
import Button from "../elements/Button"

interface AddResultModalProps {
  closeModal: () => void
}

const AddResultModal: React.FC<AddResultModalProps> = ({ closeModal }) => {
  const [result, setResult] = useState<Partial<TournamentResult>>({
    placement: 1,
    date: (new Date() as unknown) as string,
  })
  const toast = useToast()

  const [addResult] = useMutation<boolean, TournamentResult>(ADD_RESULT, {
    variables: {
      ...(result as TournamentResult),
      date: result.date?.toString() as string,
    },
    onCompleted: () => {
      closeModal()
      toast({
        description: "Result added",
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
    refetchQueries: ["searchForTeam"],
  })

  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!result.tournament_name) {
      setError("Tournament name is a required field")
    } else if (result.tournament_name.length > 100) {
      setError("Tournament name has to be 100 or less characters")
    } else if (result.tweet_id && isNaN(result.tweet_id as any)) {
      setError("Invalid Tweet ID")
    } else if (result.placement && result.placement > 500) {
      setError("Placement has to be between 1 and 500.")
    } else {
      setError(null)
    }
  }, [result])

  const handleChange = (newValueObject: Partial<TournamentResult>) => {
    setResult({ ...result, ...newValueObject })
  }

  return (
    <Modal title="Adding a new tournament result" closeModal={closeModal}>
      <Box display="flex" flexDirection="column">
        <Box>
          <Input
            label="Tournament name"
            value={result.tournament_name}
            setValue={value => handleChange({ tournament_name: value })}
          />
        </Box>
        <Box mt="1em">
          <Label>Date</Label>
          <DatePicker
            date={result.date ? new Date(result.date) : new Date()}
            setDate={value => handleChange({ date: value?.toString() })}
          />
        </Box>
        <Box mt="1em">
          <Input
            label="Tweet id"
            value={result.tweet_id}
            setValue={value => handleChange({ tweet_id: value })}
            textLeft="https://twitter.com/.../status/"
          />
        </Box>
        {result.tweet_id && (
          <Box mt="1em">
            <TweetEmbed
              id={result.tweet_id}
              options={{ theme: "dark", dnt: "true", conversation: "none" }}
            />
          </Box>
        )}
      </Box>
      <Box mt="1em">
        <PlacementInput
          value={result.placement}
          onChange={value => handleChange({ placement: value })}
        />
      </Box>
      <Box mt="1em">
        <Button disabled={!!error} onClick={() => addResult()}>
          Submit
        </Button>
        <Box as="span" ml="0.5em">
          <Button outlined onClick={() => closeModal()}>
            Cancel
          </Button>
        </Box>
      </Box>
      {error && (
        <Box mt="0.5em" color="red.500">
          {error}
        </Box>
      )}
    </Modal>
  )
}

export default AddResultModal
