import React from "react"
import { Build } from "../../types"
import { Flex, Box } from "@chakra-ui/core"
import BuildCard from "../builds/BuildCard"
import useLocalStorage from "@rehooks/local-storage"

interface BuildTabProps {
  builds: Build[]
  canModifyBuilds: boolean
}

const BuildTab: React.FC<BuildTabProps> = ({ builds, canModifyBuilds }) => {
  const [APView] = useLocalStorage<boolean>("prefersAPView")
  return (
    <>
      <Flex flexWrap="wrap" justifyContent="center">
        {builds.map(build => (
          <BuildCard
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
