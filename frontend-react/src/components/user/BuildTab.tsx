import React from "react"
import { Build } from "../../types"
import useLocalStorage from "@rehooks/local-storage"
import { useState } from "react"
import { HeadGear, ClothingGear, ShoesGear, Ability } from "../../types"
import BuildFormModal from "./BuildFormModal"
import Button from "../elements/Button"
import Alert from "../elements/Alert"
import Box from "../elements/Box"
import BuildCard from "../builds/BuildCard"

interface BuildTabProps {
  builds: Build[]
  canModifyBuilds: boolean
}

type ExistingGearObject = Record<
  Partial<HeadGear | ClothingGear | ShoesGear>,
  Ability[]
>

const buildsReducer = (acc: ExistingGearObject, cur: Build) => {
  if (cur.headgearItem) {
    acc[cur.headgearItem] = [...cur.headgear]
  }
  if (cur.clothingItem) {
    acc[cur.clothingItem] = [...cur.clothing]
  }
  if (cur.shoesItem) {
    acc[cur.shoesItem] = [...cur.shoes]
  }
  return acc
}

const BuildTab: React.FC<BuildTabProps> = ({ builds, canModifyBuilds }) => {
  const [APView] = useLocalStorage<boolean>("prefersAPView")
  const [formOpen, setFormOpen] = useState(false)
  const [buildBeingEdited, setBuildBeingEdited] = useState<Build | null>(null)

  const existingGear = builds
    ? builds.reduce(buildsReducer, {} as ExistingGearObject)
    : ({} as ExistingGearObject)

  return (
    <>
      {formOpen && (
        <BuildFormModal
          existingGear={existingGear}
          closeModal={() => {
            setFormOpen(false)
            setBuildBeingEdited(null)
          }}
          buildBeingEdited={buildBeingEdited}
        />
      )}
      {canModifyBuilds && builds.length < 100 && (
        <Button onClick={() => setFormOpen(true)}>Add build</Button>
      )}
      {canModifyBuilds && builds.length >= 100 && (
        <Alert status="info">
          You already have 100 builds. Please delete one before adding a new one
        </Alert>
      )}
      <Box display="flex" flexWrap="wrap" justifyContent="center" mt="1em">
        {builds.map(build => (
          <BuildCard
            canModify={canModifyBuilds}
            setBuildBeingEdited={(build: Build) => {
              setBuildBeingEdited(build)
              setFormOpen(true)
            }}
            key={build.id}
            build={build}
            defaultToAPView={APView !== null ? APView : false}
            m="0.5em"
          />
        ))}
      </Box>
    </>
  )
}

export default BuildTab
