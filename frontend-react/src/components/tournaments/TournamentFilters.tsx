import React, { useState, useContext } from "react"
import Button from "../elements/Button"
import { Collapse, Grid, Flex, Box, RadioGroup, Radio } from "@chakra-ui/core"
import Input from "../elements/Input"
import WeaponSelector from "../common/WeaponSelector"
import Select from "../elements/Select"
import Label from "../elements/Label"
import MyThemeContext from "../../themeContext"
import { Weapon } from "../../types"
import { maps } from "../../utils/lists"

interface TournamentFiltersProps {
  forms: {
    tournament_name?: string
    region?: string
    player_name?: string
    team_name?: string
    comp?: string[]
    mode?: string
    stage?: string
  }
  handleChange: (value: Object) => void
  handleClear: () => void
  onSubmit: () => void
}

const TournamentFilters: React.FC<TournamentFiltersProps> = ({
  forms,
  handleChange,
  handleClear,
  onSubmit,
}) => {
  const { themeColor } = useContext(MyThemeContext)
  const [show, setShow] = useState(false)
  return (
    <>
      <Button onClick={() => setShow(!show)}>
        {show ? "Hide filters" : "Show filters"}
      </Button>
      <Collapse mt={4} isOpen={show}>
        <Grid maxW="500px" gridRowGap="1em" gridTemplateColumns="1fr">
          <Input
            label="Tournament"
            value={forms.tournament_name ?? ""}
            setValue={(value: string) =>
              handleChange({ tournament_name: value })
            }
          />
          <Input
            label="Team"
            value={forms.team_name ?? ""}
            setValue={(value: string) => handleChange({ team_name: value })}
          />
          <Input
            label="Player"
            value={forms.player_name ?? ""}
            setValue={(value: string) => handleChange({ player_name: value })}
          />
          <WeaponSelector
            label="Comp"
            value={(forms.comp as Weapon[]) ?? []}
            setValue={(value: Weapon[]) => handleChange({ comp: value })}
            isMulti
          />
          <Select
            label="Map & mode"
            isSearchable
            value={
              forms.stage && forms.mode ? `${forms.stage} (${forms.mode})` : ""
            }
            setValue={(value: string) => {
              const partsArray = value.split(" (")
              handleChange({
                stage: partsArray[0],
                mode: partsArray[1].substring(0, partsArray[1].length - 1),
              })
            }}
            options={maps.reduce(
              (acc: { label: string; value: string }[], cur: string) => [
                ...acc,
                { label: `${cur} (TW)`, value: `${cur} (TW)` },
                { label: `${cur} (SZ)`, value: `${cur} (SZ)` },
                { label: `${cur} (TC)`, value: `${cur} (TC)` },
                { label: `${cur} (RM)`, value: `${cur} (RM)` },
                { label: `${cur} (CB)`, value: `${cur} (CB)` },
              ],
              []
            )}
          />
          <Box mt="0.5em">
            <Label>Mode</Label>
            <RadioGroup
              value={forms.region ?? "all"}
              defaultValue="0"
              spacing={5}
              isInline
              onChange={(e, value: any) => handleChange({ region: value })}
            >
              <Radio variantColor={themeColor} value="all">
                All
              </Radio>
              <Radio variantColor={themeColor} value="western">
                Western only
              </Radio>
              <Radio variantColor={themeColor} value="jpn">
                Japanese only
              </Radio>
            </RadioGroup>
          </Box>
          <Flex mt="1em">
            <Button onClick={onSubmit}>Apply</Button>
            <Box mx="1em">
              <Button outlined onClick={handleClear}>
                Clear filters
              </Button>
            </Box>
          </Flex>
        </Grid>
      </Collapse>
    </>
  )
}

export default TournamentFilters
