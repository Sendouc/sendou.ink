import React from "react"
import { Box } from "@chakra-ui/core"
import "./Logo.css"

interface LogoProps {
  mobile?: boolean
}

const Logo: React.FC<LogoProps> = ({ mobile = false }) => {
  return (
    <Box className={mobile ? "mobile" : "desktop"} userSelect="none">
      <Box
        className="s"
        as="span"
        display="inline-block"
        transform="translateY(-7px)"
        fontSize="30px"
        fontFamily="'Pacifico', cursive"
        transition="1.1s"
      >
        S
      </Box>
      <Box
        className="ink"
        as="span"
        display="inline-block"
        transform="translateY(7px)"
        fontSize="30px"
        fontFamily="'Pacifico', cursive"
        transition="1.1s"
      >
        ink
      </Box>
    </Box>
  )
}

export default Logo
