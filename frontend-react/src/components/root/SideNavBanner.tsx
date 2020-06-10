import React, { useState } from "react"
import { Box, Flex, Image } from "@chakra-ui/core"
import Markdown from "../elements/Markdown"
import { FiExternalLink } from "react-icons/fi"
import IconButton from "../elements/IconButton"
import { IoMdClose } from "react-icons/io"
import { useQuery } from "@apollo/react-hooks"
import { BANNERS, BannersData } from "../../graphql/queries/banners"

interface SideNavBannerProps {}

const SideNavBanner: React.FC<SideNavBannerProps> = ({}) => {
  const [closed, setClosed] = useState(false)
  const { data } = useQuery<BannersData>(BANNERS)

  if (!data || closed) return null

  const closedBannerIds: string[] = JSON.parse(
    localStorage.getItem("closedBanners") ?? "[]"
  )

  const banners = data.banners.filter(
    (banner) => !closedBannerIds.includes(banner.id)
  )
  if (!banners.length) return null

  const banner = banners[0]
  return (
    <Box
      borderRadius="5px"
      p="1em"
      backgroundColor={banner.bgColor}
      mt="2em"
      color={banner.textColor}
      w="200px"
      mx="auto"
      textAlign="center"
    >
      <Box position="absolute" right="30px" mt="-10px">
        <IconButton
          icon={IoMdClose}
          size="md"
          onClick={() => {
            setClosed(true)
            localStorage.setItem(
              "closedBanners",
              JSON.stringify(closedBannerIds.concat(banner.id))
            )
          }}
        />
      </Box>
      <Image src={banner.logoUrl} maxW="50%" mb="0.5em" minH="50px" mx="auto" />

      <Markdown value={banner.description} />
      <Flex justifyContent="center" alignItems="center">
        <a href={banner.link}>Learn more</a>
        <Box as={FiExternalLink} ml="0.5em" mb="0.2em" />
      </Flex>
    </Box>
  )
}

export default SideNavBanner
