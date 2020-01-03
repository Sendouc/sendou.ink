import React, { useState, useEffect } from "react"
import { Card, Image, Icon, Popup, Button } from "semantic-ui-react"
import { useHistory } from "react-router-dom"
import english_internal from "../../utils/english_internal.json"

import { wpnMedium } from "../../assets/imageImports"
import top500 from "../../assets/xleaderboardIcons/all.png"
import BuildDeleteModal from "../user/BuildDeleteModal.js"
import AddBuildForm from "../user/AddBuildForm.js"
import BuildAbilityView from "./BuildAbilityView.js"
import BuildApView from "./BuildApView.js"

const BuildCard = ({
  build,
  existingAbilities,
  setAbilities,
  removeBuildFunction,
  editBuildFunction,
  buildsArray,
  setWeapon,
  setHeadgear,
  setClothing,
  setShoes,
  prefersAPView,
  showWeapon = true,
  showDescription = true,
}) => {
  const [showEdit, setShowEdit] = useState(false)
  const [apView, setApView] = useState(prefersAPView ? prefersAPView : false)
  const history = useHistory()

  useEffect(() => {
    setApView(prefersAPView)
  }, [prefersAPView])

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

  const buildTitle =
    !build.title || build.title === "" ? `${build.weapon} Build` : build.title
  const buildDescription = !build.description ? "" : build.description

  return (
    <Card
      raised
      style={{ overflowWrap: "break-word", userSelect: "none" }}
      onClick={setAbilities ? null : () => setApView(!apView)}
    >
      {showWeapon && (
        <Card.Content textAlign="center">
          <Image
            style={{
              marginRight: "0.2em",
              cursor: setWeapon ? "pointer" : null,
            }}
            src={wpnMedium[english_internal[build.weapon]]}
            size="tiny"
            centered
            onClick={() => (setWeapon ? setWeapon("") : null)}
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
          <Card.Meta
            onClick={() => history.push(`/u/${build.discord_id}`)}
            style={{ color: "#4183C4" }}
          >
            {build.discord_user.username}#{build.discord_user.discriminator}
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
        {apView ? (
          <BuildApView build={build} />
        ) : (
          <BuildAbilityView
            build={build}
            setHeadgear={setHeadgear}
            setClothing={setClothing}
            setShoes={setShoes}
            setAbilities={setAbilities}
            existingAbilities={existingAbilities}
          />
        )}
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
