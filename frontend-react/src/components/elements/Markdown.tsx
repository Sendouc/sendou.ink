import React, { useContext } from "react"
import {
  Text,
  Code,
  Divider,
  Link,
  List,
  Checkbox,
  ListItem,
  Heading,
  Image,
} from "@chakra-ui/core"
import ReactMarkdown from "react-markdown"
import MyThemeContext from "../../themeContext"
import reactStringReplace from "react-string-replace"
import Emoji from "./Emoji"

interface MarkdownProps {
  value: string
}

const Markdown: React.FC<MarkdownProps> = ({ value }) => {
  const { themeColorWithShade } = useContext(MyThemeContext)

  //https://github.com/mustaphaturhan/chakra-ui-markdown-renderer/blob/master/src/index.js
  const ChakraUIRenderer = () => {
    function getCoreProps(props: any) {
      return props["data-sourcepos"]
        ? { "data-sourcepos": props["data-sourcepos"] }
        : {}
    }

    return {
      paragraph: (props: any) => {
        const { children } = props
        return <Text mb={2}>{children}</Text>
      },
      emphasis: (props: any) => {
        const { children } = props
        return <Text as="em">{children}</Text>
      },
      blockquote: (props: any) => {
        const { children } = props
        return <Code p={2}>{children}</Code>
      },
      code: (props: any) => {
        const { language, value } = props
        const className = language && `language-${language}`
        return (
          <pre {...getCoreProps(props)}>
            <Code p={2} className={className || undefined}>
              {value}
            </Code>
          </pre>
        )
      },
      delete: (props: any) => {
        const { children } = props
        return <Text as="del">{children}</Text>
      },
      thematicBreak: Divider,
      link: (props: any) => {
        const { children } = props
        return (
          <Link color={themeColorWithShade} {...props}>
            {children}
          </Link>
        )
      },
      img: Image,
      linkReference: (props: any) => {
        const { children } = props
        return (
          <Link color={themeColorWithShade} {...props}>
            {children}
          </Link>
        )
      },
      imageReference: Image,
      text: (props: any) => {
        const { children } = props
        return (
          <Text as="span" fontFamily="'Rubik', sans-serif">
            {reactStringReplace(children, /(:\S+:)/g, (match, i) => (
              <Emoji key={i} value={match} />
            ))}
          </Text>
        )
      },
      list: (props: any) => {
        const { start, ordered, children, depth } = props
        const attrs = getCoreProps(props)
        if (start !== null && start !== 1 && start !== undefined) {
          // @ts-ignore
          attrs.start = start.toString()
        }
        let styleType = "disc"
        if (ordered) styleType = "decimal"
        if (depth === 1) styleType = "circle"
        return (
          <List
            spacing={24}
            as={ordered ? "ol" : "ul"}
            styleType={styleType}
            pl={4}
            {...attrs}
          >
            {children}
          </List>
        )
      },
      listItem: (props: any) => {
        const { children, checked } = props
        let checkbox = null
        if (checked !== null && checked !== undefined) {
          checkbox = (
            <Checkbox isChecked={checked} isReadOnly>
              {children}
            </Checkbox>
          )
        }
        return (
          <ListItem
            {...getCoreProps(props)}
            listStyleType={checked !== null ? "none" : "inherit"}
          >
            {checkbox || children}
          </ListItem>
        )
      },
      definition: () => null,
      heading: (props: any) => {
        const { children } = props
        return (
          <Heading
            my={4}
            size="lg"
            {...getCoreProps(props)}
            fontFamily="'Rubik', sans-serif"
          >
            {children}
          </Heading>
        )
      },
      inlineCode: (props: any) => {
        const { children } = props
        return <Code {...getCoreProps(props)}>{children}</Code>
      },
    }
  }
  return (
    <ReactMarkdown
      source={value}
      renderers={ChakraUIRenderer()}
      disallowedTypes={["imageReference", "image"]}
    />
  )
}

export default Markdown
