import React, { useState } from "react"
import { Input, Button, Form } from "semantic-ui-react"

import { updateTwitter } from "../../graphql/mutations/updateTwitter"
import { useMutation } from "@apollo/react-hooks"

const AddTwitter = ({ handleSuccess, handleError }) => {
  const [uid, setUid] = useState("")
  const [twitter, setTwitter] = useState("")

  const [updateTwitterMutation] = useMutation(updateTwitter, {
    onError: handleError,
    onCompleted: () =>
      handleSuccess("Twitter of the player updated!", `/xsearch/p/${uid}`),
  })

  const handleSubmit = async e => {
    e.preventDefault()

    await updateTwitterMutation({
      variables: { unique_id: uid, twitter },
    })

    setUid("")
    setTwitter("")
  }
  return (
    <>
      <h2>Add Twitter for a player</h2>
      <Form onSubmit={handleSubmit}>
        <label>Enter unique id:</label>
        <Form.Field>
          <Input value={uid} onChange={event => setUid(event.target.value)} />
        </Form.Field>
        <label>Twitter</label>
        <Form.Field>
          <Input
            value={twitter}
            onChange={event => setTwitter(event.target.value)}
          />
        </Form.Field>
        <Form.Field>
          <Button type="submit" disabled={!uid || !twitter}>
            Submit
          </Button>
        </Form.Field>
      </Form>
    </>
  )
}

export default AddTwitter
