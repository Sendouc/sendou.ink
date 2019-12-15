import React, { useState, useEffect } from "react"
import { Header, Form, Select, Button } from "semantic-ui-react"
import CountryDropdown from "./CountryDropdown"
import WeaponDropdown from "../common/WeaponDropdown"
import { updateUser } from "../../graphql/mutations/updateUser"
import { searchForUser } from "../../graphql/queries/searchForUser"
import { useMutation } from "@apollo/react-hooks"

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

  const handleProfileUpdate = async e => {
    const newProfile = { ...forms }
    if (newProfile.country === "") newProfile.country = null
    if (newProfile.stick_sens === "") newProfile.stick_sens = null
    if (newProfile.motion_sens === "") newProfile.motion_sens = null

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
      <Form style={{ marginTop: "2em" }}>
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
      </Form>
      <div style={{ marginTop: "1.5em" }}>
        <Button onClick={() => handleProfileUpdate()} disabled={submitDisabled}>
          Save
        </Button>
        <span style={{ marginLeft: "0.3em" }}>
          <Button negative onClick={closeSettings}>
            Cancel
          </Button>
        </span>
      </div>
    </>
  )
}

export default Settings
