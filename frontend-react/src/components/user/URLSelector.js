import React from "react"
import { Input, Message } from "semantic-ui-react"

const URLSelector = ({ value, onChange, error }) => {
  return (
    <>
      {!error && (
        <Message>
          Please note that custom URL can't be changed once selected
        </Message>
      )}
      <Input
        label="https://sendou.ink/u/"
        placeholder="custom URL of your choice"
        value={value}
        onChange={onChange}
      />
    </>
  )
}

export default URLSelector
