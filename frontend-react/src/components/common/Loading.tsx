import React from "react"
import { Spinner, Box } from "@chakra-ui/core"
import useTheme from "../../hooks/useTheme"

interface LoadingProps {}

const Loading: React.FC<LoadingProps> = () => {
  const { themeColorWithShade } = useTheme()
  return (
    <Box textAlign="center">
      <Spinner
        color={themeColorWithShade}
        size="xl"
        thickness="4px"
        speed="0.65s"
      />
    </Box>
  )
}

export default Loading
