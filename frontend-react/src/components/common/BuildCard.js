import React, { useState } from "react"
import { Card, Image, Icon, Popup, Button } from "semantic-ui-react"
import { Link } from "react-router-dom"
import english_internal from "../../utils/english_internal.json"
import AbilityIcon from "./AbilityIcon"

import { wpnMedium } from "../../assets/imageImports"
import top500 from "../../assets/xleaderboardIcons/all.png"
import BuildDeleteModal from "../user/BuildDeleteModal.js"
import AddBuildForm from "../user/AddBuildForm.js"

const BuildCard = ({
  build,
  existingAbilities,
  setAbilities,
  removeBuildFunction,
  editBuildFunction,
  buildsArray,
  showWeapon = true,
  showDescription = true,
}) => {
  const [showEdit, setShowEdit] = useState(false)

  if (showEdit) {
    return (
      <div style={{ minWidth: "100%" }}>
        <AddBuildForm
          existingBuild={build}
          setShowEdit={setShowEdit}
          editBuildFunction={editBuildFunction}
          buildsArray={buildsArray}
        />
      </div>
    )
  }

  function removeAbility(gearIndex, slotIndex) {
    let copyOfArray = [...existingAbilities]
    copyOfArray[gearIndex][slotIndex] = ""
    setAbilities(copyOfArray)
  }

  const buildTitle =
    !build.title || build.title === "" ? `${build.weapon} Build` : build.title
  const buildDescription = !build.description ? "" : build.description
  const noItems = !build.headgearItem && !build.clothingItem && !build.shoesItem

  return (
    <Card raised style={{ overflowWrap: "break-word" }}>
      {showWeapon && (
        <Card.Content textAlign="center">
          <Image
            style={{ marginRight: "0.2em" }}
            src={wpnMedium[english_internal[build.weapon]]}
            size="tiny"
            centered
          />
        </Card.Content>
      )}
      <Card.Content>
        <Card.Header>
          {build.top && (
            <img
              src={top500}
              style={{ width: "12%", height: "auto" }}
              alt="top 500"
            />
          )}{" "}
          {buildTitle}
        </Card.Header>
        {build.discord_user && (
          <Card.Meta>
            <Link to={`/u/${build.discord_id}`} style={{ color: "#4183C4" }}>
              {build.discord_user.username}#{build.discord_user.discriminator}
            </Link>
          </Card.Meta>
        )}
        {build.updatedAt && (
          <Card.Meta>
            {new Date(parseInt(build.updatedAt)).toLocaleString()}
            {build.description && showDescription && (
              <Popup
                content={buildDescription}
                style={{ whiteSpace: "pre-wrap" }}
                trigger={
                  <Icon
                    style={{ marginLeft: "0.25em" }}
                    name="info circle"
                    color="teal"
                    size="large"
                  />
                }
              />
            )}
          </Card.Meta>
        )}
        <div style={{ marginTop: "1em" }}>
          {build.headgearItem && (
            <Image
              style={{ width: "25%", height: "auto", marginRight: "1em" }}
              src={`https://raw.githubusercontent.com/Leanny/leanny.github.io/master/splat2/gear/${
                english_internal[build.headgearItem]
              }.png`}
            />
          )}
          <span
            style={{ marginLeft: !build.headgearItem && !noItems && "80px" }}
          >
            {build.headgear.map((ability, index) => (
              <AbilityIcon
                key={index}
                ability={ability}
                size={index === 0 ? "MAIN" : "SUB"}
                style={{ margin: "0 0.3em 0 0" }}
                onClick={setAbilities ? () => removeAbility(0, index) : null}
              />
            ))}
          </span>
        </div>
        <div
          style={{
            margin: build.clothingItem ? "0 0 0 0" : "0.5em 0 0.5em 0",
          }}
        >
          {build.clothingItem && (
            <Image
              style={{ width: "25%", height: "auto", marginRight: "1em" }}
              src={`https://raw.githubusercontent.com/Leanny/leanny.github.io/master/splat2/gear/${
                english_internal[build.clothingItem]
              }.png`}
            />
          )}
          <span
            style={{ marginLeft: !build.clothingItem && !noItems && "80px" }}
          >
            {build.clothing.map((ability, index) => (
              <AbilityIcon
                key={index}
                ability={ability}
                size={index === 0 ? "MAIN" : "SUB"}
                style={{ margin: "0 0.3em 0 0" }}
                onClick={setAbilities ? () => removeAbility(1, index) : null}
              />
            ))}
          </span>
        </div>
        <>
          {build.shoesItem && (
            <Image
              style={{ width: "25%", height: "auto", marginRight: "1em" }}
              src={`https://raw.githubusercontent.com/Leanny/leanny.github.io/master/splat2/gear/${
                english_internal[build.shoesItem]
              }.png`}
            />
          )}
          <span style={{ marginLeft: !build.shoesItem && !noItems && "80px" }}>
            {build.shoes.map((ability, index) => (
              <AbilityIcon
                key={index}
                ability={ability}
                size={index === 0 ? "MAIN" : "SUB"}
                style={{ margin: "0 0.3em 0 0" }}
                onClick={setAbilities ? () => removeAbility(2, index) : null}
              />
            ))}
          </span>
        </>
      </Card.Content>
      {removeBuildFunction && (
        <Card.Content extra>
          <div className="ui two buttons">
            <Button basic color="black" onClick={() => setShowEdit(true)}>
              Edit build
            </Button>
            <BuildDeleteModal
              trigger={
                <Button basic color="red">
                  Delete build
                </Button>
              }
              buildTitle={buildTitle}
              onConfirm={() => removeBuildFunction(build)}
            />
          </div>
        </Card.Content>
      )}
    </Card>
  )
}

export default BuildCard
