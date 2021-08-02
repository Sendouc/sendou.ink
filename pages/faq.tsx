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
import { VOUCH_CRITERIA } from "utils/constants";

const questionsAndAnswers = [
  {
    q: "How do I update my avatar?",
    a: (
      <>
        After updating it on Discord you can get it updated without delay by
        logging out and logging back in (on sendou.ink - not Discord).
        Additionally if you want to have your avatar automatically update make
        sure you are on Sendou&apos;s Discord server. This way your avatar will
        be automatically updated periodically.
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
          showInfo
        />
      </>
    ),
  },
  {
    q: "Can my tournament have a badge as a price?",
    a: (
      <>
        Yes commission{" "}
        <MyLink href="https://twitter.com/borzoic_/" isExternal>
          borzoic
        </MyLink>{" "}
        to make the logo&apos;s 3D model. Price is 10-30€ depending on the
        complexity. Afterwards contact Sendou for info on how to get it showing
        on the site.
      </>
    ),
  },
  {
    q: "How do I add an image for my tournament to show on the calendar?",
    a: (
      <>
        DM Sendou with your tournament&apos;s logo. Logo has to be a square
        (e.g. 500x500 dimensions).
      </>
    ),
  },
  {
    q: "What is the Plus Server?",
    a: (
      <>
        Plus Server is a Discord server for high level western players to look
        for players to play with and against. It is divided into three different
        tiers of which +1 is the highest. You get access when a member of the
        server suggests you and you pass the monthly voting.
        <br />
        <br /> In the voting you get percentage based on your result. 0% would
        mean everyone gave you the worst possible score while 100% would be the
        opposite. 50% is required to pass the voting. If a member gets a score
        below 50% they get demoted a tier or in the case of +3 kicked.
        <br />
        <br /> Members are divided into two regions for voting: NA and EU. For
        players living outside of these regions when joining they choose the
        region they most commonly play with. Every member of the server can vote
        on others of the same tier (members, suggested players and vouched
        players). +1 or -1 is the score given to those of the opposite region
        and -2, -1, +1 or +2 to those of the same region.
        <br />
        <br /> Alternative way to get in is if an existing member with a good
        voting result in the last voting vouches you. In that case you get
        access immediately. Percentages required to gain vouch rights are{" "}
        {VOUCH_CRITERIA[1]}% (+1 members), {VOUCH_CRITERIA[2]}% (+2 members),{" "}
        {VOUCH_CRITERIA[3]}% (+3 members),
      </>
    ),
  },
] as const;

const FAQPage = () => {
  return (
    <>
      <MyHead title="FAQ" />
      <Accordion allowToggle>
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
