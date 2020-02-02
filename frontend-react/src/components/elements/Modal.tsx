import React, { useContext } from "react"
import Button from "./Button"
import Box from "./Box"
import MyThemeContext from "../../themeContext"
import useBreakPoints from "../../hooks/useBreakPoints"

interface ModalProps {
  children: JSX.Element | JSX.Element[]
  title: string
}

const Modal: React.FC<ModalProps> = ({ children, title }) => {
  const { darkerBgColor } = useContext(MyThemeContext)
  const isSmall = useBreakPoints(768)

  return (
    <Box
      position="fixed"
      zIndex={5}
      left={0}
      top={0}
      width="100%"
      height="100%"
      overflow="auto"
      bg="rgba(0,0,0,0.4)"
    >
      <Box
        bg={darkerBgColor}
        margin="15% auto"
        padding="20px"
        border="1px solid #888"
        borderRadius="5px"
        w={isSmall ? "100%" : "80%"}
        maxWidth="1100px"
      >
        <>
          <Box fontSize="24px" fontWeight="black" mb="1.5em">
            {title}
          </Box>
          {children}
        </>
      </Box>
    </Box>
  )
}

export default Modal
