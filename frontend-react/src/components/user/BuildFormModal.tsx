import React, { useState } from "react"
import Modal from "../elements/Modal"
import WeaponSelector from "../common/WeaponSelector"
import { Weapon, Build, HeadGear, ClothingGear, ShoesGear } from "../../types"
import WeaponImage from "../common/WeaponImage"
import Select from "../elements/Select"
import {
  headSelectOptions,
  clothingSelectOptions,
  shoesSelectOptions,
} from "../../utils/lists"
import Box from "../elements/Box"
import GearImage from "../builds/GearImage"
import Input from "../elements/Input"

interface BuildFormModalProps {}

const BuildFormModal: React.FC<BuildFormModalProps> = ({}) => {
  const [build, setBuild] = useState<Partial<Build>>({})

  const handleChange = (value: Object) => setBuild({ ...build, ...value })

  return (
    <Modal title="Adding a new build">
      <WeaponSelector
        required
        label="Weapon"
        setValue={(weapon: Weapon) => handleChange({ weapon })}
      />
      {build.weapon && (
        <WeaponImage englishName={build.weapon as Weapon} size="MEDIUM" />
      )}
      <Box asFlex mt="1em" justifyContent="space-between" flexWrap="wrap">
        <Box asFlex flexDirection="column" alignItems="center">
          <Select
            placeholder="Select headgear"
            label="Headgear"
            options={headSelectOptions}
            clearable
            setValue={(headgearItem: HeadGear) =>
              setBuild({ ...build, headgearItem })
            }
          />
          {build.headgearItem && <GearImage englishName={build.headgearItem} />}
        </Box>
        <Box asFlex flexDirection="column" alignItems="center">
          <Select
            placeholder="Select headgear"
            label="Clothing"
            options={clothingSelectOptions}
            clearable
            setValue={(clothingItem: ClothingGear) =>
              setBuild({ ...build, clothingItem })
            }
          />
          {build.clothingItem && <GearImage englishName={build.clothingItem} />}
        </Box>
        <Box asFlex flexDirection="column" alignItems="center">
          <Select
            placeholder="Select headgear"
            label="Shoes"
            options={shoesSelectOptions}
            clearable
            setValue={(shoesItem: ShoesGear) =>
              setBuild({ ...build, shoesItem })
            }
          />
          {build.shoesItem && <GearImage englishName={build.shoesItem} />}
        </Box>
      </Box>
      <Box mt="1em">
        <Input
          value={build.title}
          setValue={(value: string) => handleChange({ title: value })}
          placeholder="Title"
        />
      </Box>
    </Modal>
  )
}

export default BuildFormModal
