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

const questionsAndAnswers = [
  {
    q: "How do I update my avatar?",
    a: (
      <>
        After updating it on Discord you can get it updated without delay by
        logging out and logging back in (on sendou.ink - not Discord).
        Additionally if you want to have your avatar automatically update make
        sure you are on Sendou's Discord server. This way your avatar will be
        automatically updated periodically.
      </>
    ),
  },
  {
    q: "How can I link my Top 500/league results?",
    a: (
      <>
        Check out{" "}
        <MyLink href="/linking-info">https://sendou.ink/linking-info</MyLink>
      </>
    ),
  },
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
  {
    q: "Can my tournament have a badge as a prize?",
    a: (
      <>
        Yes commission{" "}
        <MyLink href="https://twitter.com/borzoic_/" isExternal>
          borzoic
        </MyLink>{" "}
        to make the logo's 3D model. Prize is 10-30€ depending on the
        complexity. Afterwards contact Sendou for info on how to get it showing
        on the site.
      </>
    ),
  },
  {
    q: "How do I add an image for my tournament to show on the calendar?",
    a: (
      <>
        DM Sendou with your tournament's logo. Logo has to be a square (e.g.
        500x500 dimensions).
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
