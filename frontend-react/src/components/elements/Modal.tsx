import { Box, Flex } from "@chakra-ui/core"
import React, { useContext, useEffect } from "react"
import { MdClose } from "react-icons/md"
import useOnClickOutside from "use-onclickoutside"
import useBreakPoints from "../../hooks/useBreakPoints"
import MyThemeContext from "../../themeContext"
import IconButton from "./IconButton"

interface ModalProps {
  title: string
  closeModal?: () => void
  closeOnOutsideClick?: boolean
}

const Modal: React.FC<ModalProps> = ({
  children,
  title,
  closeModal,
  closeOnOutsideClick,
}) => {
  const { bgColor } = useContext(MyThemeContext)
  const isSmall = useBreakPoints(768)
  const ref: any = React.useRef()
  useOnClickOutside(ref, closeOnOutsideClick ? (closeModal as any) : null)

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
        bg={bgColor}
        margin="2% auto"
        padding="10px 20px 20px 20px"
        border="1px solid #888"
        borderRadius="5px"
        w={isSmall ? "100%" : "80%"}
        maxWidth="1100px"
        ref={ref}
      >
        <>
          <Flex
            justifyContent="space-between"
            alignItems="center"
            fontSize="24px"
            fontWeight="black"
            mb="0.5em"
          >
            {title}
            {closeModal && (
              <IconButton icon={<MdClose />} onClick={() => closeModal()} />
            )}
          </Flex>
          {children}
        </>
      </Box>
    </Box>
  )
}

export default Modal
