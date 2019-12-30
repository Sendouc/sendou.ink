import React, { useState, useEffect } from "react"
import { Header, Form, Select, Button, Message, Label } from "semantic-ui-react"
import CountryDropdown from "./CountryDropdown"
import WeaponDropdown from "../common/WeaponDropdown"
import { updateUser } from "../../graphql/mutations/updateUser"
import { searchForUser } from "../../graphql/queries/searchForUser"
import { useMutation } from "@apollo/react-hooks"
import URLSelector from "./URLSelector"

const sensOptions = [
  -5,
  -4.5,
  -4,
  -3.5,
  -3,
  -2.5,
  -2,
  -1.5,
  -1,
  -0.5,
  0,
  0.5,
  1,
  1.5,
  2,
  2.5,
  3,
  3.5,
  4,
  4.5,
  5,
]

const Settings = ({ user, closeSettings, handleSuccess, handleError }) => {
  const [forms, setForms] = useState(user)
  const [submitDisabled, setSubmitDisabled] = useState(true)
  const [customURLError, setCustomURLError] = useState(null)

  useEffect(() => {
    if (JSON.stringify(user) === JSON.stringify(forms)) setSubmitDisabled(true)
    else if (forms.motion_sens !== "" && forms.stick_sens === "")
      setSubmitDisabled(true)
    else setSubmitDisabled(false)
  }, [forms, user])

  const [editUserMutation] = useMutation(updateUser, {
    onCompleted: handleSuccess,
    onError: handleError,
    refetchQueries: [
      {
        query: searchForUser,
        variables: { discord_id: user.discord_id },
      },
    ],
  })

  useEffect(() => {
    const url = forms.custom_url ?? ""
    if (url.length < 2)
      setCustomURLError("Custom URL has to be over 2 characters long")
    else if (url.length > 32)
      setCustomURLError("Custom URL has to be under 32 characters long")
    else if (!isNaN(url))
      setCustomURLError("Custom URL has to contain at least one letter")
    else if (!/^[a-z0-9]+$/i.test(url))
      setCustomURLError("Custom URL can only contain letters and numbers")
    else setCustomURLError("")
  }, [forms.custom_url])

  const handleSubmit = async () => {
    const newProfile = { ...forms }
    if (newProfile.country === "") newProfile.country = null
    if (newProfile.stick_sens === "") newProfile.stick_sens = null
    if (newProfile.motion_sens === "") newProfile.motion_sens = null
    if (newProfile.custom_url === "") newProfile.custom_url = null

    await editUserMutation({
      variables: { ...newProfile },
    })
  }

  const handleWeaponDropdownChange = (e, { value }) => {
    if (value.length <= 5) {
      setForms({ ...forms, weapons: value })
    }
  }

  const handleCountryDropdownChange = (e, { value }) => {
    setForms({ ...forms, country: value })
  }

  return (
    <>
      <Header>Update profile</Header>
      <Header size="small">Profile picture</Header>
      To add a profile picture you need to verify your Twitter on Discord and
      log back in to sendou.ink
      <Form
        style={{ marginTop: "2em" }}
        onSubmit={handleSubmit}
        error={Boolean(customURLError)}
      >
        <Form.Field>
          <label>Custom URL</label>
          <Message error>{customURLError}</Message>
          {user.custom_url ? (
            <Label>https://sendou.ink/u/{user.custom_url}</Label>
          ) : (
            <URLSelector
              value={forms.custom_url ?? ""}
              onChange={(e, { value }) =>
                setForms({ ...forms, custom_url: value })
              }
              error={Boolean(customURLError)}
            />
          )}
        </Form.Field>
        <Form.Field>
          <label>Country</label>
          <CountryDropdown
            value={forms.country}
            onChange={handleCountryDropdownChange}
          />
        </Form.Field>
        <Form.Field>
          <label>Stick sensitivity</label>
          <Select
            value={forms.stick_sens}
            onChange={(e, { value }) =>
              setForms({ ...forms, stick_sens: value })
            }
            placeholder="Stick sensitivity"
            options={sensOptions.map(sens => ({
              key: sens,
              value: sens,
              text: sens > 0 ? `+${sens}` : sens,
            }))}
            style={{ maxWidth: "270px" }}
          />
        </Form.Field>
        <Form.Field>
          <label>Motion sensitivity</label>
          <Select
            value={forms.motion_sens}
            onChange={(e, { value }) =>
              setForms({ ...forms, motion_sens: value })
            }
            placeholder="Motion sensitivity"
            options={sensOptions.map(sens => ({
              key: sens,
              value: sens,
              text: sens > 0 ? `+${sens}` : sens,
            }))}
            style={{ maxWidth: "270px" }}
          />
        </Form.Field>
        <Form.Field>
          <label>Weapon pool</label>
          <WeaponDropdown
            value={forms.weapons}
            onChange={handleWeaponDropdownChange}
            multiple
          />
        </Form.Field>
        <Form.Field>
          <Button type="submit" disabled={submitDisabled}>
            Save
          </Button>
          <span style={{ marginLeft: "0.3em" }}>
            <Button negative onClick={closeSettings}>
              Cancel
            </Button>
          </span>
        </Form.Field>
      </Form>
    </>
  )
}

export default Settings
