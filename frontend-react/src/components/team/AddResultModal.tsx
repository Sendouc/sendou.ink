import React, { useState } from "react"
import Modal from "../elements/Modal"
import Box from "../elements/Box"
import { TournamentResult } from "../../types"
import Input from "../elements/Input"
import { useMutation } from "@apollo/react-hooks"
import { useToast } from "@chakra-ui/core"
import { ADD_RESULT } from "../../graphql/mutations/addResult"
import TweetEmbed from "react-tweet-embed"
import { useContext } from "react"
import MyThemeContext from "../../themeContext"
import DatePicker from "../elements/DatePicker"
import Label from "../elements/Label"

interface AddResultModalProps {
  closeModal: () => void
}

const AddResultModal: React.FC<AddResultModalProps> = ({ closeModal }) => {
  const { colorMode } = useContext(MyThemeContext)
  const [result, setResult] = useState<Partial<TournamentResult>>({})
  const toast = useToast()

  const [addResult] = useMutation<boolean, TournamentResult>(ADD_RESULT, {
    variables: result as TournamentResult,
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
        status: "success",
        duration: 10000,
      })
    },
    refetchQueries: ["searchForUser"],
  })

  const handleChange = (newValueObject: Partial<TournamentResult>) => {
    console.log("newV", newValueObject)
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
    </Modal>
  )
}

export default AddResultModal
