import React, { useContext } from "react"
import Input from "../elements/Input"
import WeaponSelector from "../common/WeaponSelector"
import { Box, RadioGroup, Radio } from "@chakra-ui/core"
import MyThemeContext from "../../themeContext"
import { months } from "../../utils/lists"
import Select from "../elements/Select"
import Label from "../elements/Label"
import { Weapon } from "../../types"

interface Top500FormsProps {
  forms: {
    name?: string
    weapon?: string
    mode?: number
    month?: number
    year?: number
  }
  handleChange: (value: Object) => void
}

const Top500Forms: React.FC<Top500FormsProps> = ({ forms, handleChange }) => {
  const { themeColor } = useContext(MyThemeContext)

  const monthChoices = []
  let month = 5
  let year = 2018
  const date = new Date()
  const currentMonth = date.getMonth() + 1
  const currentYear = date.getFullYear()
  while (true) {
    if (month === currentMonth && year === currentYear) break
    const monthString = `${months[month]} ${year}`
    monthChoices.push({ label: monthString, value: `${month},${year}` })

    month++
    if (month === 13) {
      month = 1
      year++
    }
  }

  monthChoices.reverse()

  return (
    <Box maxW="500px">
      <Input
        value={forms.name ?? ""}
        setValue={(value: string) => handleChange({ name: value })}
        label="Name"
      />
      <Box mt="0.5em">
        <WeaponSelector
          label="Weapon"
          value={(forms.weapon as Weapon) ?? null}
          setValue={(value: string) => handleChange({ weapon: value })}
          clearable
        />
      </Box>
      <Box mt="0.5em">
        <Select
          value={
            forms.month && forms.year
              ? `${months[forms.month]} ${forms.year}`
              : ""
          }
          options={monthChoices}
          label="Month"
          setValue={(value: any) => {
            const monthParts = value.split(",")
            const month = parseInt(monthParts[0])
            const year = parseInt(monthParts[1])
            handleChange({ month, year })
          }}
          width="100%"
        />
      </Box>
      <Box mt="0.5em">
        <Label>Mode</Label>
        <RadioGroup
          value={"" + forms.mode}
          defaultValue="0"
          spacing={5}
          isInline
          onChange={(e, value: any) => handleChange({ mode: parseInt(value) })}
        >
          <Radio
            variantColor={themeColor}
            value="0"
            isChecked={forms.mode === 0 || !forms.mode}
          >
            All modes
          </Radio>
          <Radio variantColor={themeColor} value="1">
            SZ
          </Radio>
          <Radio variantColor={themeColor} value="2">
            TC
          </Radio>
          <Radio variantColor={themeColor} value="3">
            RM
          </Radio>
          <Radio variantColor={themeColor} value="4">
            CB
          </Radio>
        </RadioGroup>
      </Box>
    </Box>
  )
}

export default Top500Forms
