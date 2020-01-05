import React, { useState } from "react"
import DatePicker from "react-datepicker"

import "react-datepicker/dist/react-datepicker.css"
import Loading from "../common/Loading"
import Error from "../common/Error"
import { useQuery, useMutation } from "@apollo/react-hooks"
import { plusInfo } from "../../graphql/queries/plusInfo"
import { startVoting } from "../../graphql/mutations/startVoting"
import { Message, Button } from "semantic-ui-react"

const VotingManager = ({ handleSuccess, handleError }) => {
  const [endDate, setEndDate] = useState(new Date())
  const [confirmed, setConfirmed] = useState(false)
  const { data, error, loading } = useQuery(plusInfo)

  const [startVotingMutation] = useMutation(startVoting, {
    onError: handleError,
    onCompleted: () => handleSuccess("Voting started!"),
    refetchQueries: [
      {
        query: plusInfo,
      },
    ],
  })

  if (loading) return <Loading />
  if (error) return <Error errorMessage={error.message} />

  return (
    <>
      <h2>Manage voting</h2>
      {data.plusInfo.voting_ends ? (
        <Message>
          Voting ends{" "}
          <b>
            {new Date(parseInt(data.plusInfo.voting_ends)).toLocaleString()}
          </b>
        </Message>
      ) : (
        <>
          <DatePicker
            selected={endDate}
            onChange={date => setEndDate(date)}
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={15}
            timeCaption="time"
            dateFormat="MMMM d, yyyy h:mm aa"
          />
          <div style={{ marginTop: "1em" }}>
            {!confirmed ? (
              <Button onClick={() => setConfirmed(true)}>Start voting</Button>
            ) : (
              <Button
                onClick={async () =>
                  await startVotingMutation({ variables: { ends: endDate } })
                }
              >
                Start voting for real?
              </Button>
            )}
          </div>
        </>
      )}
    </>
  )
}

export default VotingManager
