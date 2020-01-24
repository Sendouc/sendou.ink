import React, { useContext } from "react"
import { Spinner, Box } from "@chakra-ui/core"
import MyThemeContext from "../../themeContext"

interface LoadingProps {}

const Loading: React.FC<LoadingProps> = () => {
  const { themeColorWithShade } = useContext(MyThemeContext)
  return (
    <Box textAlign="center" pt="2em">
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
