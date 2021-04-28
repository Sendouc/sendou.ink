import {
  Checkbox,
  Code,
  Divider,
  Heading,
  Image,
  Link,
  List,
  ListItem,
  Text,
} from "@chakra-ui/react";
import Emoji from "components/common/Emoji";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "components/common/Table";
import { useMyTheme } from "hooks/common";
import ReactMarkdown from "react-markdown";
import reactStringReplace from "react-string-replace";
import gfm from "remark-gfm";
import MyLink from "./MyLink";

interface MarkdownProps {
  value: string;
  allowAll?: boolean;
  smallHeaders?: boolean;
}

const Markdown: React.FC<MarkdownProps> = ({
  value,
  allowAll = false,
  smallHeaders = false,
}) => {
  const { themeColorHex: themeColor } = useMyTheme();

  //https://github.com/mustaphaturhan/chakra-ui-markdown-renderer/blob/master/src/index.js
  const ChakraUIRenderer = () => {
    function getCoreProps(props: any) {
      return props["data-sourcepos"]
        ? { "data-sourcepos": props["data-sourcepos"] }
        : {};
    }

    return {
      paragraph: (props: any) => {
        const { children } = props;
        return <Text mb={2}>{children}</Text>;
      },
      emphasis: (props: any) => {
        const { children } = props;
        return <Text as="em">{children}</Text>;
      },
      blockquote: (props: any) => {
        const { children } = props;
        return <Code p={2}>{children}</Code>;
      },
      code: (props: any) => {
        const { language, value } = props;
        const className = language && `language-${language}`;
        return (
          <pre {...getCoreProps(props)}>
            <Code p={2} className={className || undefined}>
              {value}
            </Code>
          </pre>
        );
      },
      delete: (props: any) => {
        const { children } = props;
        return <Text as="del">{children}</Text>;
      },
      thematicBreak: Divider,
      link: (props: any) => {
        const { children } = props;
        return (
          <MyLink isExternal {...props} toNewWindow>
            {children}
          </MyLink>
        );
      },
      linkReference: (props: any) => {
        const { children } = props;
        return (
          <Link color={themeColor} {...props}>
            {children}
          </Link>
        );
      },
      text: (props: any) => {
        const { children } = props;

        // TODO: "react-dom.development.js?61bb:67 Warning: validateDOMNesting(...): <div> cannot appear as a descendant of <p>."
        return (
          <Text as="span">
            {reactStringReplace(children, /(:\S+:)/g, (match, i) => (
              <Emoji key={i} value={match} />
            ))}
          </Text>
        );
      },
      list: (props: any) => {
        const { start, ordered, children, depth } = props;
        const attrs = getCoreProps(props);
        if (start !== null && start !== 1 && start !== undefined) {
          // @ts-ignore
          attrs.start = start.toString();
        }
        let styleType = "disc";
        if (ordered) styleType = "decimal";
        if (depth === 1) styleType = "circle";
        return (
          <List
            spacing={2}
            as={ordered ? "ol" : "ul"}
            styleType={styleType}
            pl={4}
            {...attrs}
          >
            {children}
          </List>
        );
      },
      listItem: (props: any) => {
        const { children, checked } = props;
        let checkbox = null;
        if (checked !== null && checked !== undefined) {
          checkbox = (
            <Checkbox isChecked={checked} isReadOnly>
              {children}
            </Checkbox>
          );
        }
        return (
          <ListItem
            {...getCoreProps(props)}
            listStyleType={checked !== null ? "none" : "inherit"}
          >
            {checkbox || children}
          </ListItem>
        );
      },
      definition: () => null,
      heading: (props: any) => {
        const { children } = props;

        if (smallHeaders) {
          return (
            <Heading as="h3" mt={2} mb={1} size="md" {...getCoreProps(props)}>
              {children}
            </Heading>
          );
        }

        if (props.level === 1) {
          return (
            <Heading as="h1" mt={8} mb={4} size="2xl" {...getCoreProps(props)}>
              {children}
            </Heading>
          );
        }

        if (props.level === 2) {
          return (
            <Heading as="h2" mt={4} mb={2} size={"lg"} {...getCoreProps(props)}>
              {children}
            </Heading>
          );
        }

        return (
          <Heading as="h3" mt={2} mb={1} size="md" {...getCoreProps(props)}>
            {children}
          </Heading>
        );
      },
      inlineCode: (props: any) => {
        const { children } = props;
        return <Code {...getCoreProps(props)}>{children}</Code>;
      },
      table: (props: any) => {
        const { children } = props;
        return <Table {...getCoreProps(props)}>{children}</Table>;
      },
      tableHead: (props: any) => {
        const { children } = props;
        return <TableHead {...getCoreProps(props)}>{children}</TableHead>;
      },
      tableBody: (props: any) => {
        const { children } = props;
        return <TableBody {...getCoreProps(props)}>{children}</TableBody>;
      },
      tableRow: (props: any) => {
        const { children } = props;
        return <TableRow {...getCoreProps(props)}>{children}</TableRow>;
      },
      tableCell: (props: any) => {
        const { children, isHeader } = props;
        if (isHeader) {
          return <TableHeader {...getCoreProps(props)}>{children}</TableHeader>;
        }
        return <TableCell {...getCoreProps(props)}>{children}</TableCell>;
      },
      image: (props: any) => <Image {...props} my={4} />,
    };
  };
  return (
    <ReactMarkdown
      source={value.replace(/\n/g, "  \n")}
      renderers={ChakraUIRenderer()}
      disallowedTypes={allowAll ? [] : ["imageReference", "image"]}
      plugins={[gfm]}
    />
  );
};

export default Markdown;
