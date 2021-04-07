import {
  Divider,
  ListItem,
  OrderedList,
  UnorderedList,
} from "@chakra-ui/react";
import Markdown from "components/common/Markdown";
import SubText from "components/common/SubText";
import HeaderBanner from "components/layout/HeaderBanner";
import fs from "fs";
import { GetStaticPaths, GetStaticProps } from "next";
import { join } from "path";
import { Fragment } from "react";
import MyHead from "../../../components/common/MyHead";

interface Props {
  text: string;
  sections: { name: string; parts: string[] }[];
}

const SalmonRunGuidePage = ({ text, sections }: Props) => {
  return (
    <>
      <MyHead title="Salmon Run Guide" />
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
    </>
  );
};

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const text = fs
    .readFileSync(
      join(
        process.cwd(),
        "utils",
        "data",
        "sr",
        `${(params!.level as string).toLowerCase()}.md`
      )
    )
    .toString();

  return {
    props: {
      text,
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

SalmonRunGuidePage.header = (
  <HeaderBanner icon="sr" title="Salmon Run" subtitle="Learn how to overfish" />
);

export default SalmonRunGuidePage;
