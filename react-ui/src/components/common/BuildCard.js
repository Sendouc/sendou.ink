import React, { useState } from "react"
import { Card, Image, Icon, Popup, Button } from "semantic-ui-react"
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
  showWeapon = true,
  showDescription = true
}) => {
  const [expanded, setExpanded] = useState(false)
  const [showEdit, setShowEdit] = useState(false)

  function removeAbility(gearIndex, slotIndex) {
    let copyOfArray = [...existingAbilities]
    copyOfArray[gearIndex][slotIndex] = ""
    setAbilities(copyOfArray)
  }

  const buildTitle =
    !build.title || build.title === "" ? `${build.weapon} Build` : build.title
  const buildDescription = !build.description ? "" : build.description

  if (showEdit)
    return (
      <div style={{ minWidth: "100%" }}>
        <AddBuildForm
          existingBuild={build}
          setShowEdit={setShowEdit}
          editBuildFunction={editBuildFunction}
        />
      </div>
    )

  const BCard = () => {
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
              {build.discord_user.username}#{build.discord_user.discriminator}
            </Card.Meta>
          )}
          {build.updatedAt && (
            <Card.Meta>
              {new Date(parseInt(build.updatedAt)).toLocaleString()}
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
            {build.headgear.map((ability, index) => (
              <AbilityIcon
                key={index}
                ability={ability}
                size={index === 0 ? "MAIN" : "SUB"}
                style={{ margin: "0 0.3em 0 0" }}
                onClick={setAbilities ? () => removeAbility(0, index) : null}
              />
            ))}
          </div>
          <div
            style={{
              margin: build.clothingItem ? "0 0 0 0" : "0.5em 0 0.5em 0"
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
            {build.clothing.map((ability, index) => (
              <AbilityIcon
                key={index}
                ability={ability}
                size={index === 0 ? "MAIN" : "SUB"}
                style={{ margin: "0 0.3em 0 0" }}
                onClick={setAbilities ? () => removeAbility(1, index) : null}
              />
            ))}
          </div>
          <div>
            {build.shoesItem && (
              <Image
                style={{ width: "25%", height: "auto", marginRight: "1em" }}
                src={`https://raw.githubusercontent.com/Leanny/leanny.github.io/master/splat2/gear/${
                  english_internal[build.shoesItem]
                }.png`}
              />
            )}
            {build.shoes.map((ability, index) => (
              <AbilityIcon
                key={index}
                ability={ability}
                size={index === 0 ? "MAIN" : "SUB"}
                style={{ margin: "0 0.3em 0 0" }}
                onClick={setAbilities ? () => removeAbility(2, index) : null}
              />
            ))}
          </div>
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
        {build.description && showDescription && (
          <Card.Content extra>
            <span
              style={{ cursor: "pointer", userSelect: "none" }}
              onClick={() => setExpanded(!expanded)}
            >
              <Icon name="mouse pointer" />
              Click here to see the description
            </span>
          </Card.Content>
        )}
      </Card>
    )
  }

  if (build.description)
    return (
      <Popup
        content={buildDescription}
        position="bottom center"
        open={expanded}
        trigger={<BCard />}
      />
    )

  return <BCard />
}

export default BuildCard
