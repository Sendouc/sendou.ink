//https://github.com/mustaphaturhan/chakra-ui-markdown-renderer/blob/master/src/index.js

import React from "react"
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

function ChakraUIRenderer() {
  function getCoreProps(props) {
    return props["data-sourcepos"]
      ? { "data-sourcepos": props["data-sourcepos"] }
      : {}
  }

  return {
    paragraph: (props) => {
      const { children } = props
      return <Text mb={2}>{children}</Text>
    },
    emphasis: (props) => {
      const { children } = props
      return <Text as="em">{children}</Text>
    },
    blockquote: (props) => {
      const { children } = props
      return <Code p={2}>{children}</Code>
    },
    code: (props) => {
      const { language, value } = props
      const className = language && `language-${language}`
      return (
        <pre {...getCoreProps(props)}>
          <Code p={2} className={className || null}>
            {value}
          </Code>
        </pre>
      )
    },
    delete: (props) => {
      const { children } = props
      return <Text as="del">{children}</Text>
    },
    thematicBreak: Divider,
    link: Link,
    img: Image,
    linkReference: Link,
    imageReference: Image,
    text: (props) => {
      const { children } = props
      return <Text as="span">{children}</Text>
    },
    list: (props) => {
      const { start, ordered, children, depth } = props
      const attrs = getCoreProps(props)
      if (start !== null && start !== 1 && start !== undefined) {
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
    listItem: (props) => {
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
    heading: (props) => {
      const { level, children } = props
      const sizes = ["2xl", "xl", "lg", "md", "sm", "xs"]
      return (
        <Heading
          my={4}
          as={`h${level}`}
          size={sizes[`${level - 1}`]}
          {...getCoreProps(props)}
          fontFamily="'Rubik', cursive"
        >
          {children}
        </Heading>
      )
    },
    inlineCode: (props) => {
      const { children } = props
      return <Code {...getCoreProps(props)}>{children}</Code>
    },
  }
}

export default ChakraUIRenderer
