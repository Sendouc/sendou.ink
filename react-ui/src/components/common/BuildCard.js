import React, { useState } from "react"
import { Card, Grid, Image } from "semantic-ui-react"
import english_internal from "../../utils/english_internal.json"
import AbilityIcon from "./AbilityIcon"

import { wpnMedium } from "../../assets/imageImports"

const BuildCard = ({
  build,
  existingAbilities,
  setAbilities,
  removeBuildFunction,
  editBuildFunction
}) => {
  console.log("build", build)
  return (
    <Card raised>
      <Card.Content textAlign="center">
        <Image
          style={{ marginRight: "0.2em" }}
          src={wpnMedium[english_internal[build.weapon]]}
          size="tiny"
          centered
        />
      </Card.Content>
      <Card.Content>
        <Card.Header>{build.title}</Card.Header>
        <Grid columns={4} style={{ marginTop: "1em" }}>
          <Grid.Row>
            <Grid.Column width={5}>
              {build.headgearItem && (
                <Image
                  src={`https://raw.githubusercontent.com/Leanny/leanny.github.io/master/splat2/gear/${
                    english_internal[build.headgearItem]
                  }.png`}
                />
              )}
            </Grid.Column>
            {build.headgear.map((ability, index) => (
              <Grid.Column width={index === 0 ? 3 : 2}>
                <AbilityIcon
                  key={index}
                  ability={ability}
                  size={index === 0 ? "MAIN" : "SUB"}
                />
              </Grid.Column>
            ))}
          </Grid.Row>
        </Grid>
      </Card.Content>
    </Card>
  )
}

export default BuildCard
