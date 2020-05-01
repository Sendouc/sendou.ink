import React from "react"
import { Heading } from "@chakra-ui/core"
import { useContext } from "react"
import MyThemeContext from "../../themeContext"

interface PageHeaderProps {
  title: string
}

const PageHeader: React.FC<PageHeaderProps> = ({ title }) => {
  const { themeColorWithShade } = useContext(MyThemeContext)
  return (
    <>
      <Heading
        className="shadow"
        borderLeftColor={themeColorWithShade}
        borderLeftWidth="5px"
        pl="5px"
        mb="0.5em"
        fontFamily="'Rubik', sans-serif"
        fontWeight="bold"
      >
        {title}
      </Heading>
    </>
  )
}

export default PageHeader
