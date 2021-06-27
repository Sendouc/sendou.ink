import MyHead from "components/common/MyHead";
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
} from "@chakra-ui/accordion";
import { Box } from "@chakra-ui/layout";
import MyLink from "components/common/MyLink";
import Badges from "components/u/Badges";

/*
//     //"Moray Towers",
//     //"Port Mackerel",
//     //"Walleye Warehouse",
//     //"Arowana Mall",
//     //"Kelp Dome"
 */

const questionsAndAnswers = [
  {
    q: "What badges are there? Who made them?",
    a: (
      <>
        All badges are made by{" "}
        <MyLink href="https://twitter.com/borzoic_/" isExternal>
          borzoic
        </MyLink>
        .
        <Badges
          userId={-1}
          userDiscordId="-1"
          patreonTier={-1}
          presentationMode
        />
      </>
    ),
  },
] as const;

const FAQPage = () => {
  return (
    <>
      <MyHead title="FAQ" />
      <Accordion>
        {questionsAndAnswers.map(({ q, a }) => (
          <AccordionItem key={q}>
            <h2>
              <AccordionButton>
                <Box flex="1" textAlign="left" fontWeight="bold">
                  {q}
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>{a}</AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>
    </>
  );
};

export default FAQPage;
