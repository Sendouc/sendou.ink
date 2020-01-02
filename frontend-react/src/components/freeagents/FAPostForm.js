import React, { useState } from "react"
import {
  Form,
  Checkbox,
  Radio,
  Message,
  Button,
  Header,
} from "semantic-ui-react"
import { useMutation } from "@apollo/react-hooks"

import TextAreaWithLimit from "../common/TextAreaWithLimit"
import { addFreeAgentPost } from "../../graphql/mutations/addFreeAgentPost"
import { freeAgentPosts } from "../../graphql/queries/freeAgentPosts"
import { updateFreeAgentPost } from "../../graphql/mutations/updateFreeAgentPost"

const FAPostForm = ({
  handleSuccess,
  hideForm,
  existingFAPost,
  handleError,
}) => {
  const [form, setForm] = useState(
    existingFAPost
      ? existingFAPost
      : {
          can_vc: "",
          playstyles: [],
          activity: "",
          past_experience: "",
          looking_for: "",
          description: "",
        }
  )

  const [addFAPostMutation] = useMutation(addFreeAgentPost, {
    onError: handleError,
    onCompleted: () =>
      handleSuccess(
        "New free agent post successfully created! Good luck finding a team 😎"
      ),
    refetchQueries: [
      {
        query: freeAgentPosts,
      },
    ],
  })

  const [updateFAPostMutation] = useMutation(updateFreeAgentPost, {
    onError: handleError,
    onCompleted: () => handleSuccess("Free agent post successfully updated!"),
    refetchQueries: [
      {
        query: freeAgentPosts,
      },
    ],
  })

  const handlePlaystyleChange = (e, { value }) => {
    if (form.playstyles.indexOf(value) !== -1) {
      setForm({
        ...form,
        playstyles: form.playstyles.filter(playstyle => playstyle !== value),
      })
    } else {
      setForm({ ...form, playstyles: [...form.playstyles, value] })
    }
  }

  const handleSubmit = async event => {
    event.preventDefault()
    const postToAdd = { ...form }
    //https://stackoverflow.com/a/38340730
    Object.keys(postToAdd).forEach(
      key => !postToAdd[key] && delete postToAdd[key]
    )
    if (existingFAPost) await updateFAPostMutation({ variables: postToAdd })
    else await addFAPostMutation({ variables: postToAdd })
  }

  return (
    <>
      <Header>
        {existingFAPost
          ? "Edit your free agent post"
          : "Make a new free agent post"}
      </Header>
      <Message>
        Profile picture, Discord name, Twitter user, weapon pool and Top 500
        history are automatically synced up with your profile. Also please note
        that the post automatically sent to Discord{" "}
        <b>can't be edited afterwards </b> so you might want to set these
        beforehand.
      </Message>
      <Form onSubmit={handleSubmit}>
        <Form.Field required>
          <label>Playstyles</label>
          <Form.Field>
            <Checkbox
              label="Frontline/Slayer"
              value="FRONTLINE"
              checked={form.playstyles.indexOf("FRONTLINE") !== -1}
              onChange={handlePlaystyleChange}
            />
          </Form.Field>
          <Form.Field>
            <Checkbox
              label="Midline/Support"
              value="MIDLINE"
              checked={form.playstyles.indexOf("MIDLINE") !== -1}
              onChange={handlePlaystyleChange}
            />
          </Form.Field>
          <Form.Field>
            <Checkbox
              label="Backline/Anchor"
              value="BACKLINE"
              checked={form.playstyles.indexOf("BACKLINE") !== -1}
              onChange={handlePlaystyleChange}
            />
          </Form.Field>
        </Form.Field>
        <Form.Field required>
          <label>Can you voice chat?</label>
          <Form.Field>
            <Radio
              label="Yes"
              value="YES"
              checked={form.can_vc === "YES"}
              onChange={() => setForm({ ...form, can_vc: "YES" })}
            />
          </Form.Field>
          <Form.Field>
            <Radio
              label="Usually"
              value="USUALLY"
              checked={form.can_vc === "USUALLY"}
              onChange={() => setForm({ ...form, can_vc: "USUALLY" })}
            />
          </Form.Field>
          <Form.Field>
            <Radio
              label="Sometimes"
              value="SOMETIMES"
              checked={form.can_vc === "SOMETIMES"}
              onChange={() => setForm({ ...form, can_vc: "SOMETIMES" })}
            />
          </Form.Field>
          <Form.Field>
            <Radio
              label="No"
              value="NO"
              checked={form.can_vc === "NO"}
              onChange={() => setForm({ ...form, can_vc: "NO" })}
            />
          </Form.Field>
        </Form.Field>
        <Form.Field>
          <label>Past competitive experience</label>
          <TextAreaWithLimit
            value={form.past_experience}
            setValue={value => setForm({ ...form, past_experience: value })}
            limit={100}
            style={{ height: "75px" }}
          />
        </Form.Field>
        <Form.Field>
          <label>What is your activity like on a typical week?</label>
          <TextAreaWithLimit
            value={form.activity}
            setValue={value => setForm({ ...form, activity: value })}
            limit={100}
            style={{ height: "75px" }}
          />
        </Form.Field>
        <Form.Field>
          <label>What are you looking from a team?</label>
          <TextAreaWithLimit
            value={form.looking_for}
            setValue={value => setForm({ ...form, looking_for: value })}
            limit={100}
            style={{ height: "75px" }}
          />
        </Form.Field>
        <Form.Field>
          <label>Free word</label>
          <TextAreaWithLimit
            value={form.description}
            setValue={value => setForm({ ...form, description: value })}
            limit={1000}
          />
        </Form.Field>
        <Form.Field>
          <Button
            type="submit"
            disabled={!form.can_vc || form.playstyles.length === 0}
          >
            Submit
          </Button>
          <span style={{ marginLeft: "0.3em" }}>
            <Button type="button" negative onClick={hideForm}>
              Cancel
            </Button>
          </span>
        </Form.Field>
      </Form>
    </>
  )
}

export default FAPostForm
