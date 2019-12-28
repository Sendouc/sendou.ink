import React, { useState } from "react"
import { Message, Image, Icon, Radio, Form, Button } from "semantic-ui-react"
import { Link } from "react-router-dom"
import { useMutation } from "@apollo/react-hooks"

import UserSearch from "../common/UserSearch"
import TextAreaWithLimit from "../common/TextAreaWithLimit"
import { addSuggestion } from "../../graphql/mutations/addSuggestion"
import { suggestions } from "../../graphql/queries/suggestions"

const SuggestionForm = ({
  plusServer,
  hideForm,
  handleSuccess,
  handleError,
}) => {
  const [selectedUser, setSelectedUser] = useState(null)
  const [form, setForm] = useState({})

  const [addSuggestionMutation] = useMutation(addSuggestion, {
    onError: handleError,
    onCompleted: handleSuccess,
    refetchQueries: [
      {
        query: suggestions,
      },
    ],
  })

  const handleSubmit = async event => {
    event.preventDefault()
    await addSuggestionMutation({
      variables: { ...form, discord_id: selectedUser.id },
    })
  }

  return (
    <>
      {selectedUser ? (
        <Form onSubmit={handleSubmit}>
          <Form.Field>
            <h3>Suggesting</h3>
          </Form.Field>
          <Form.Field>
            <div>
              {selectedUser.image && <Image src={selectedUser.image} avatar />}
              <Link
                to={`/u/${selectedUser.id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {selectedUser.title}
              </Link>
              {selectedUser.description && (
                <div style={{ marginTop: "0.5em" }}>
                  <Icon
                    name="twitter"
                    size="large"
                    style={{ color: "#1da1f2" }}
                  />
                  <a
                    href={`https://twitter.com/${selectedUser.description}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {selectedUser.description}
                  </a>
                </div>
              )}
            </div>
          </Form.Field>
          <Form.Field required>
            <label>Server</label>
            <Form.Field>
              <Radio
                label="+1"
                disabled={plusServer !== "ONE"}
                value="ONE"
                checked={form.server === "ONE"}
                onChange={() => setForm({ ...form, server: "ONE" })}
              />
            </Form.Field>
            <Form.Field>
              <Radio
                label="+2"
                value="TWO"
                checked={form.server === "TWO"}
                onChange={() => setForm({ ...form, server: "TWO" })}
              />
            </Form.Field>
          </Form.Field>
          <Form.Field required>
            <label>Region</label>
            <Form.Field>
              <Radio
                label="Europe"
                value="EU"
                checked={form.region === "EU"}
                onChange={() => setForm({ ...form, region: "EU" })}
              />
            </Form.Field>
            <Form.Field>
              <Radio
                label="The Americas"
                value="NA"
                checked={form.region === "NA"}
                onChange={() => setForm({ ...form, region: "NA" })}
              />
            </Form.Field>
            <Form.Field>
              If the player suggested doesn't live in either Europe or The
              Americas you can choose the region based on who they are playing
              more often with.
            </Form.Field>
          </Form.Field>
          <Form.Field required>
            <label>Description</label>
            <Form.Field>
              <TextAreaWithLimit
                value={form.description}
                setValue={value => setForm({ ...form, description: value })}
                limit={1000}
              />
            </Form.Field>
          </Form.Field>
          <Form.Field>
            <b>
              You can't edit or delete a suggestion after you have submitted it
            </b>
          </Form.Field>
          <Form.Field>
            <Button
              type="submit"
              disabled={!form.server || !form.region || !form.description}
            >
              Submit
            </Button>
            <span style={{ marginLeft: "0.3em" }}>
              <Button type="button" negative onClick={() => hideForm()}>
                Cancel
              </Button>
            </span>
          </Form.Field>
        </Form>
      ) : (
        <>
          <Message>
            Note that you can only search for people who have logged in to
            sendou.ink at least once
          </Message>
          <div>
            <label>
              <b>
                Search for a player to suggest using Discord name, Twitter name
                or Discord ID
              </b>
            </label>
          </div>
          <div style={{ marginTop: "1em" }}>
            <UserSearch setSelection={setSelectedUser} />
          </div>
          <div style={{ marginTop: "1em" }}>
            <Button type="button" negative onClick={() => hideForm()}>
              Cancel
            </Button>
          </div>
        </>
      )}
    </>
  )
}

export default SuggestionForm
