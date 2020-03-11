import React, { useContext } from "react"
import Box from "./Box"
import MyThemeContext from "../../themeContext"
import useBreakPoints from "../../hooks/useBreakPoints"
import IconButton from "./IconButton"
import { MdClose } from "react-icons/md"
import { useEffect } from "react"

interface ModalProps {
  title: string
  closeModal?: () => void
}

const Modal: React.FC<ModalProps> = ({ children, title, closeModal }) => {
  const { darkerBgColor } = useContext(MyThemeContext)
  const isSmall = useBreakPoints(768)

  useEffect(() => {
    document.body.style.overflow = "hidden"

    return () => {
      document.body.style.overflow = "visible"
    }
  }, [])

  return (
    <Box
      position="fixed"
      zIndex={5}
      left={0}
      top={0}
      width="100%"
      height="100%"
      overflow="auto"
      bg="rgba(0,0,0,0.75)"
    >
      <Box
        bg={darkerBgColor}
        margin="2% auto"
        padding="10px 20px 20px 20px"
        border="1px solid #888"
        borderRadius="5px"
        w={isSmall ? "100%" : "80%"}
        maxWidth="1100px"
      >
        <>
          <Box
            asFlex
            justifyContent="space-between"
            alignItems="center"
            fontSize="24px"
            fontWeight="black"
            mb="0.5em"
          >
            {title}
            {closeModal && (
              <IconButton icon={MdClose} onClick={() => closeModal()} />
            )}
          </Box>
          {children}
        </>
      </Box>
    </Box>
  )
}

export default Modal
