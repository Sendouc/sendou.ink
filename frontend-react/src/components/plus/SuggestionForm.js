import React, { useState } from "react"
import { Message, Image, Icon, Radio, Form, Button } from "semantic-ui-react"
import { Link } from "react-router-dom"
import { useMutation } from "@apollo/react-hooks"

import UserSearch from "../common/UserSearch"
import TextAreaWithLimit from "../common/TextAreaWithLimit"
import { addSuggestion } from "../../graphql/mutations/addSuggestion"
import { suggestions } from "../../graphql/queries/suggestions"
import { vouches } from "../../graphql/queries/vouches"
import { addVouch } from "../../graphql/mutations/addVouch"
import { userLean } from "../../graphql/queries/userLean"

const SuggestionForm = ({
  plusServer,
  hideForm,
  handleSuccess,
  handleError,
  canSuggest,
  canVouch,
  canVouchFor,
}) => {
  const [selectedUser, setSelectedUser] = useState(null)
  const [form, setForm] = useState({ type: !canSuggest ? "VOUCH" : "SUGGEST" })

  const [addSuggestionMutation] = useMutation(addSuggestion, {
    onError: handleError,
    onCompleted: () => handleSuccess("Suggestion successfully added."),
    refetchQueries: [
      {
        query: suggestions,
      },
    ],
  })

  const [addVouchMutation] = useMutation(addVouch, {
    onError: handleError,
    onCompleted: () =>
      handleSuccess(
        "Vouch successfully added. Let them know and send them an invite link to the server!"
      ),
    refetchQueries: [
      {
        query: vouches,
      },
      {
        query: userLean,
      },
      {
        query: suggestions,
      },
    ],
  })

  const handleSubmit = async event => {
    event.preventDefault()
    if (form.type === "SUGGEST") {
      await addSuggestionMutation({
        variables: { ...form, discord_id: selectedUser.id },
      })
    } else {
      await addVouchMutation({
        variables: { ...form, discord_id: selectedUser.id },
      })
    }
  }

  return (
    <>
      {selectedUser ? (
        <Form onSubmit={handleSubmit}>
          <Form.Field required>
            <Form.Field>
              <Radio
                label="Suggest"
                disabled={!canSuggest}
                value="SUGGEST"
                checked={form.type === "SUGGEST"}
                onChange={() => setForm({ type: "SUGGEST" })}
              />
            </Form.Field>
            <Form.Field>
              <Radio
                label="Vouch"
                value="VOUCH"
                disabled={!canVouch}
                checked={form.type === "VOUCH"}
                onChange={() => setForm({ type: "VOUCH" })}
              />
            </Form.Field>
          </Form.Field>
          <Form.Field>
            {form.type === "SUGGEST" && <h3>Suggesting</h3>}
            {form.type === "VOUCH" && <h3>Vouching</h3>}
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
                  <Icon name="twitter" style={{ color: "#1da1f2" }} />
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
                disabled={
                  (form.type === "SUGGEST" && plusServer !== "ONE") ||
                  (form.type === "VOUCH" && canVouchFor !== "ONE")
                }
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
              If the player doesn't live in either Europe or The Americas you
              can choose the region based on who they are playing more often
              with.
            </Form.Field>
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
          </Form.Field>
          {form.type === "SUGGEST" && (
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
          )}
          {form.type === "SUGGEST" ? (
            <Form.Field>
              <b>
                You can't edit or delete a suggestion after you have submitted
                it. One suggestion per month.
              </b>
            </Form.Field>
          ) : (
            <Form.Field>
              <b>
                You can't change or delete a vouch after you have submitted it.
                One vouch per player active at any given time. If your vouch
                gets kicked in their first voting you may not vouch for the next
                6 months.
              </b>
            </Form.Field>
          )}
          <Form.Field>
            <Button
              type="submit"
              disabled={
                (form.type === "SUGGEST" &&
                  (!form.server || !form.region || !form.description)) ||
                (form.type === "VOUCH" && (!form.server || !form.region))
              }
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
