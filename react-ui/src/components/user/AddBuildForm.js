import React, { useState } from "react"
import { Form, Message, Button } from "semantic-ui-react"
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
  const [abilities, setAbilities] = useState(
    existingBuild
      ? [
          [...existingBuild.headgear],
          [...existingBuild.clothing],
          [...existingBuild.shoes]
        ]
      : [["", "", "", ""], ["", "", "", ""], ["", "", "", ""]]
  )
  const [head, setHead] = useState("")
  const [clothes, setClothes] = useState("")
  const [shoes, setShoes] = useState("")

  const build = {
    id: existingBuild ? existingBuild.id : null,
    weapon: weapon,
    title,
    headgear: abilities[0],
    clothing: abilities[1],
    shoes: abilities[2]
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
            <label>{"Choose title (optional)"}</label>
            <input value={title} onChange={e => setTitle(e.target.value)} />
            <Message
              error
              content={"Title can't be longer than 100 characters."}
            />
          </Form.Field>
          <Form.Group widths="equal">
            <Form.Field>
              <label>Head gear</label>
              <GearSearch slot="head" setGear={setHead} />
            </Form.Field>
            <Form.Field>
              <label>Clothes gear</label>
              <GearSearch slot="clothes" setGear={setClothes} />
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
