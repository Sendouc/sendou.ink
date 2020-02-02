import React from "react"
import { Build } from "../../types"
import { Flex } from "@chakra-ui/core"
import BuildCard from "../builds/BuildCard"
import useLocalStorage from "@rehooks/local-storage"
import Button from "../elements/Button"
import { useState } from "react"
import Alert from "../elements/Alert"
import BuildFormModal from "./BuildFormModal"

interface BuildTabProps {
  builds: Build[]
  canModifyBuilds: boolean
}

const BuildTab: React.FC<BuildTabProps> = ({ builds, canModifyBuilds }) => {
  const [APView] = useLocalStorage<boolean>("prefersAPView")
  const [formOpen, setFormOpen] = useState(true)
  return (
    <>
      {formOpen && <BuildFormModal />}
      {canModifyBuilds && builds.length < 100 && (
        <Button onClick={() => setFormOpen(true)}>Add build</Button>
      )}
      {canModifyBuilds && builds.length >= 100 && (
        <Alert status="info">
          You already have 100 builds. Please delete one before adding a new one
        </Alert>
      )}
      <Flex flexWrap="wrap" justifyContent="center" mt="1em">
        {builds.map(build => (
          <BuildCard
            key={build.id}
            build={build}
            defaultToAPView={APView !== null ? APView : false}
            m="0.5em"
          />
        ))}
      </Flex>
    </>
  )
}

export default BuildTab
