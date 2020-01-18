import React from "react"
import { Spinner, useColorMode, Box } from "@chakra-ui/core"

interface LoadingProps {}

const Loading: React.FC<LoadingProps> = () => {
  const { colorMode } = useColorMode()
  const color = { light: "orange.500", dark: "pink.200" }
  return (
    <Box textAlign="center">
      <Spinner
        color={color[colorMode]}
        size="xl"
        thickness="4px"
        speed="0.65s"
      />
    </Box>
  )
}

export default Loading
