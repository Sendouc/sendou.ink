import React, { useState } from "react"
import { Card, Grid, Image, Icon } from "semantic-ui-react"
import english_internal from "../../utils/english_internal.json"
import AbilityIcon from "./AbilityIcon"

import { wpnMedium } from "../../assets/imageImports"

const BuildCard = ({
  build,
  existingAbilities,
  setAbilities,
  removeBuildFunction,
  editBuildFunction,
  showWeapon = true
}) => {
  console.log("build", build)
  return (
    <Card raised>
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
        <Card.Header>{build.title}</Card.Header>
        {build.discord_user && (
          <Card.Meta>
            {build.discord_user.username}#{build.discord_user.discriminator}
          </Card.Meta>
        )}
        <div style={{ marginTop: build.headgearItem ? "0" : "0.5em" }}>
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
            />
          ))}
        </div>
        <div
          style={{ margin: build.clothingItem ? "0 0 0 0" : "0.5em 0 0.5em 0" }}
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
            />
          ))}
        </div>
      </Card.Content>
      {!build.description && (
        <Card.Content extra>
          <a>
            <Icon name="mouse pointer" />
            Click here to expand description
          </a>
        </Card.Content>
      )}
    </Card>
  )
}

export default BuildCard
