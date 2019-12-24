import React, { useState } from "react"
import { Message, Card, Image, Icon, Radio, Form } from "semantic-ui-react"

import UserSearch from "../common/UserSearch"

const SuggestionForm = ({ plusServer }) => {
  const [selectedUser, setSelectedUser] = useState(null)
  const [form, setForm] = useState({})
  return (
    <>
      {!selectedUser && (
        <>
          <Message>
            Note that you can only search for people who have logged in to
            sendou.ink at least once
          </Message>
          <label>
            <b>
              Search for a player to suggest using Discord name, Twitter name or
              Discord ID
            </b>
          </label>
          <UserSearch setSelection={setSelectedUser} />
        </>
      )}
      {selectedUser && (
        <>
          <Card>
            <Image src={selectedUser.image} wrapped ui={false} />
            <Card.Content>
              <Card.Header>{selectedUser.title}</Card.Header>
              <Card.Description style={{ marginTop: "1em" }}>
                {selectedUser.description && (
                  <>
                    <Icon
                      name="twitter"
                      size="large"
                      style={{ color: "#1da1f2" }}
                    />
                    <a href={`https://twitter.com/${selectedUser.description}`}>
                      {selectedUser.description}
                    </a>
                  </>
                )}
              </Card.Description>
            </Card.Content>
          </Card>
          <Form>
            <Form.Field>
              <label>Suggested for</label>
              <Form.Field>
                <Radio
                  label="+1"
                  disabled={plusServer !== "ONE"}
                  value="ONE"
                  checked={form.plus_server === "ONE"}
                  onChange={() => console.log("AAA")}
                />
              </Form.Field>
              <Form.Field>
                <Radio
                  label="+2"
                  value="TWO"
                  checked={form.plus_server === "TWO"}
                  onChange={() => console.log("BBB")}
                />
              </Form.Field>
            </Form.Field>
          </Form>
        </>
      )}
    </>
  )
}

export default SuggestionForm
