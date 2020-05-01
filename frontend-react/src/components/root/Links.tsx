import React, { useContext } from "react"
import { useQuery } from "@apollo/react-hooks"
import { LINKS } from "../../graphql/queries/links"
import Loading from "../common/Loading"
import Error from "../common/Error"
import { Helmet } from "react-helmet-async"
import PageHeader from "../common/PageHeader"
import { RouteComponentProps } from "@reach/router"
import { Heading, Link, Flex, Box } from "@chakra-ui/core"
import MyThemeContext from "../../themeContext"

interface Link {
  title: string
  url: string
  description: string
  type: "GUIDE" | "DISCORD" | "MISC"
}

interface LinksData {
  links: Link[]
}

const Links: React.FC<RouteComponentProps> = () => {
  const { data, error, loading } = useQuery<LinksData>(LINKS)
  const { themeColorWithShade, grayWithShade } = useContext(MyThemeContext)

  if (loading || !data) return <Loading />
  if (error) return <Error errorMessage={error.message} />
  const links = data.links

  const linkMap = (link: Link) => (
    <React.Fragment key={link.title}>
      <Link href={link.url} color={themeColorWithShade}>
        <b>{link.title}</b>
      </Link>
      <Box as="span" mb="0.5em" color={grayWithShade}>
        {link.description}
      </Box>
    </React.Fragment>
  )

  return (
    <>
      <Helmet>
        <title>Links | sendou.ink</title>
      </Helmet>
      <PageHeader title="Links" />
      <Heading size="lg" mb="0.5em" fontFamily="'Rubik', sans-serif">
        Guides
      </Heading>
      <Flex flexDirection="column">
        {links.filter((link) => link.type === "GUIDE").map(linkMap)}
      </Flex>
      <Heading size="lg" mb="0.5em" fontFamily="'Rubik', sans-serif">
        Discord
      </Heading>
      <Flex flexDirection="column">
        {links.filter((link) => link.type === "DISCORD").map(linkMap)}
      </Flex>
      <Heading size="lg" mb="0.5em" fontFamily="'Rubik', sans-serif">
        Misc
      </Heading>
      <Flex flexDirection="column">
        {links.filter((link) => link.type === "MISC").map(linkMap)}
      </Flex>
    </>
  )
}

export default Links
