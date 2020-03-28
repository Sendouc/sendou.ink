import React, { useContext } from "react"
import IconButton from "../elements/IconButton"
import { FaRegHeart, FaHeart } from "react-icons/fa"
import { Popover, PopoverTrigger, PopoverContent, Flex } from "@chakra-ui/core"
import MyThemeContext from "../../themeContext"

interface HeartProps {
  disabled: boolean
  active: boolean
  onClick: () => void
}

const Heart: React.FC<HeartProps> = ({ disabled, active, onClick }) => {
  const { darkerBgColor } = useContext(MyThemeContext)

  const getPopoverContent = () => {
    if (active)
      return "You have liked this free agent! If they also give you a like match will be shown on the top."
    if (disabled)
      return "Make your own free agent post to like and have a chance to match up with this player!"
    return "If you like what you see give this free agent a like and see if they want to team up with you as well!"
  }

  return (
    <>
      <Popover trigger="hover" placement="top-start">
        <PopoverTrigger>
          <Flex justifyContent="center">
            <IconButton
              colored
              disabled={disabled}
              icon={active ? FaHeart : FaRegHeart}
              color="red.500"
              onClick={onClick}
            />
          </Flex>
        </PopoverTrigger>
        <PopoverContent zIndex={4} p="0.5em" bg={darkerBgColor} border="0">
          {getPopoverContent()}
        </PopoverContent>
      </Popover>
    </>
  )
}

export default Heart
