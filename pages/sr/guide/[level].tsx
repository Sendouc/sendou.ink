// import fundamentals from "/lib/data/sr/fundamentals.md";
import {
  Divider,
  ListItem,
  OrderedList,
  UnorderedList,
} from "@chakra-ui/react";
import { t } from "@lingui/macro";
import Breadcrumbs from "components/common/Breadcrumbs";
import Markdown from "components/common/Markdown";
import MyContainer from "components/common/MyContainer";
import SubText from "components/common/SubText";
import fs from "fs";
import { GetStaticPaths, GetStaticProps } from "next";
import { join } from "path";
import { Fragment } from "react";

interface Props {
  text: string;
  sections: { name: string; parts: string[] }[];
  level: string;
}

const SalmonRunGuidePage: React.FC<Props> = ({ text, sections, level }) => {
  return (
    <MyContainer>
      <Breadcrumbs
        pages={[
          { name: t`Salmon Run` },
          { name: t`Guide` },
          { name: level.charAt(0).toUpperCase() + level.slice(1) },
        ]}
      />
      <SubText>Contents</SubText>
      <OrderedList>
        {sections.map((section) => (
          <Fragment key={section.name}>
            <ListItem fontSize="lg" fontWeight="bold">
              {section.name}
            </ListItem>
            <UnorderedList>
              {section.parts.map((part) => (
                <ListItem key={part}>{part}</ListItem>
              ))}
            </UnorderedList>
          </Fragment>
        ))}
      </OrderedList>
      <Divider my={8} />
      <Markdown value={text} allowAll />
    </MyContainer>
  );
};

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const text = fs
    .readFileSync(
      join(
        process.cwd(),
        "lib",
        "data",
        "sr",
        `${(params!.level as string).toLowerCase()}.md`
      )
    )
    .toString();

  return {
    props: {
      text,
      level: params!.level as string,
      sections: text
        .split("\n")
        .reduce((acc: { name: string; parts: string[] }[], line) => {
          if (line.startsWith("# ")) {
            acc.push({ name: line.replace("# ", ""), parts: [] });
          }
          if (line.startsWith("## ")) {
            acc[acc.length - 1].parts.push(line.replace("## ", ""));
          }

          return acc;
        }, []),
    },
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [
      { params: { level: "fundamentals" } },
      { params: { level: "advanced" } },
    ],
    fallback: false,
  };
};

export default SalmonRunGuidePage;
