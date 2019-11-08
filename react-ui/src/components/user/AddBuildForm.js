import React, { useState } from "react"
import { Form, Message, Button, TextArea } from "semantic-ui-react"
import BuildCard from "../common/BuildCard"
import AbilityButtons from "./AbilityButtons"
import WeaponDropdown from "../common/WeaponDropdown"
import GearSearch from "./GearSearch"

const AddBuildForm = ({
  addBuild,
  setShowForm,
  setSuccessMsg,
  existingBuild,
  setShowEdit,
  editBuildFunction
}) => {
  const [weapon, setWeapon] = useState(
    existingBuild ? existingBuild.weapon : ""
  )
  const [title, setTitle] = useState(
    existingBuild && existingBuild.title ? existingBuild.title : ""
  )
  const [description, setDescription] = useState(
    existingBuild && existingBuild.description ? existingBuild.description : ""
  )
  const [abilities, setAbilities] = useState(
    existingBuild
      ? [
          [...existingBuild.headgear],
          [...existingBuild.clothing],
          [...existingBuild.shoes]
        ]
      : [["", "", "", ""], ["", "", "", ""], ["", "", "", ""]]
  )
  const [headgearItem, setHeadgear] = useState(
    existingBuild && existingBuild.headgearItem
      ? existingBuild.headgearItem
      : ""
  )
  const [clothingItem, setClothing] = useState(
    existingBuild && existingBuild.clothingItem
      ? existingBuild.clothingItem
      : ""
  )
  const [shoesItem, setShoes] = useState(
    existingBuild && existingBuild.shoesItem ? existingBuild.shoesItem : ""
  )

  const build = {
    id: existingBuild ? existingBuild.id : null,
    weapon: weapon,
    title,
    description,
    headgear: abilities[0],
    clothing: abilities[1],
    shoes: abilities[2],
    headgearItem,
    clothingItem,
    shoesItem
  }

  const submit = async e => {
    e.preventDefault()

    let buildToAdd = { ...build }
    if (buildToAdd.title === "") delete buildToAdd.title

    await addBuild({
      variables: { ...buildToAdd }
    })

    setWeapon("")
    setTitle("")
    setAbilities([["", "", "", ""], ["", "", "", ""], ["", "", "", ""]])
    setSuccessMsg("New build succesfully added!")
    setTimeout(() => {
      setSuccessMsg(null)
    }, 10000)
    setShowForm(false)
  }

  function isBuildComplete() {
    if (title.length > 100) return false
    if (weapon === "") return false
    for (let i = 0; i < abilities.length; i++) {
      for (let j = 0; j < abilities[i].length; j++) {
        const element = abilities[i][j]
        if (element === "") {
          return false
        }
      }
    }
    return true
  }

  return (
    <div>
      <div>
        <BuildCard
          build={build}
          existingAbilities={abilities}
          setAbilities={setAbilities}
        />
      </div>
      <div style={{ paddingTop: "15px" }}>
        <WeaponDropdown
          value={weapon}
          onChange={(e, { value }) => setWeapon(value)}
        />
      </div>
      <div style={{ paddingTop: "10px" }}>
        <AbilityButtons abilities={abilities} setAbilities={setAbilities} />
      </div>
      <div style={{ paddingTop: "15px" }}>
        <Form error={title.length > 100}>
          <Form.Field>
            <label>Title (optional)</label>
            <input value={title} onChange={e => setTitle(e.target.value)} />
            <Message
              error
              content={"Title can't be longer than 100 characters."}
            />
          </Form.Field>
          <Form.Field>
            <label>Description</label>
            <TextArea
              value={description}
              onChange={e =>
                e.target.value.length < 1000 && setDescription(e.target.value)
              }
              rows={5}
            />
            {`${description.length}/1000`}
          </Form.Field>
          <Form.Group widths="equal">
            <Form.Field>
              <label>Head gear</label>
              <GearSearch slot="head" setGear={setHeadgear} />
            </Form.Field>
            <Form.Field>
              <label>Clothes gear</label>
              <GearSearch slot="clothes" setGear={setClothing} />
            </Form.Field>
            <Form.Field>
              <label>Shoes gear</label>
              <GearSearch slot="shoes" setGear={setShoes} />
            </Form.Field>
          </Form.Group>
        </Form>
      </div>
      <div style={{ paddingTop: "10px" }}>
        {editBuildFunction ? (
          <>
            <Button
              disabled={!isBuildComplete()}
              onClick={() => {
                editBuildFunction(build)
                setShowEdit(false)
                window.scrollTo(0, 0)
              }}
            >
              Edit build
            </Button>
            <Button negative onClick={() => setShowEdit(false)}>
              Cancel
            </Button>
          </>
        ) : (
          <Button disabled={!isBuildComplete()} onClick={submit}>
            Add build
          </Button>
        )}
      </div>
    </div>
  )
}

export default AddBuildForm
