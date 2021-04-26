import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
} from "@chakra-ui/accordion";
import { Box } from "@chakra-ui/layout";
import MyLink from "components/common/MyLink";

/*
//     //"Moray Towers",
//     //"Port Mackerel",
//     //"Walleye Warehouse",
//     //"Arowana Mall",
//     //"Kelp Dome"
 */

const questionsAndAnswers = [
  {
    q: "What is the schedule?",
    a: (
      <>
        During the beta testing phase follow my Twitter for updates. Afterwards
        the plan is that every week there would be 5 dates to play. You can
        choose when to play - there is no commitment. <br />
        <br />
        Monday, Wednesday Americas friendly times (8PM ET). Tuesday, Thursday
        Europe friendly times (8PM CET). Sunday for a time that works for both
        regions (9PM CET).
      </>
    ),
  },
  {
    q: "How many matches do we play when we register for an event?",
    a: (
      <>
        If there is an even number of teams everyone plays 2 matches. If there
        is an uneven number of teams then two teams play 1 match each and the
        rest play 2 matches.
      </>
    ),
  },
  {
    q:
      "Can I switch who I play with between the event dates? Can I sign up without a team?",
    a: (
      <>
        You can play with a different set of people each time you play the
        ladder if you want. However you need to find people to play with before
        signing up (so it doesn't work like solo queue in that sense).
      </>
    ),
  },
  {
    q: "What this the format of the matches?",
    a: (
      <>
        Best of 9. Even numbered weeks SZ/TC/RM/CB but Splat Zones is the every
        other mode. Uneven numbered weeks SZ only.
      </>
    ),
  },
  {
    q: "What is the maplist used?",
    a: <>Every map except Moray, Port, Walleye, Mall & Kelp Dome is in play.</>,
  },
  {
    q: "What ranking system is used?",
    a: (
      <>
        You can read more about the ranking system used{" "}
        <MyLink
          isExternal
          href="https://www.microsoft.com/en-us/research/project/trueskill-ranking-system"
        >
          here
        </MyLink>
        .
      </>
    ),
  },
  {
    q: "How are the teams matched?",
    a: (
      <>
        The algorithm goes through every possible way to pair the teams that are
        signed up. It chooses the match-ups based on which two ways without
        repeat matches produce the best quality of matches. Quality of match is
        determined by the theoretical likelihood of a draw as provided by the
        ranking system we use.
      </>
    ),
  },
  {
    q: "Why are players ranked and not teams? What does this mean in practice?",
    a: (
      <>
        In Splatoon teams are pretty volatile. It's common for people to play
        with a lot of different people. Even in one team there is typically a
        big difference in level depending on who from the roster is playing.
        Ranking players lets us have more accurate rankings in these conditions.
        <br />
        <br />
        If you always play with the same people the ranking system won't be able
        to make a difference between your scores. The difference only comes if
        you play with different people also.
      </>
    ),
  },
  {
    q: "How do I report the score?",
    a: (
      <>
        You report the score by DM'ing the bot Lanista#5266. She can be found on
        our{" "}
        <MyLink isExternal href="https://discord.gg/sendou">
          Discord
        </MyLink>
        . If you have not registed your Nintendo account with Lanista you have
        to use the <code>!register</code> command before. After that reporting
        the score is done with the <code>!commandhere</code> command. <br />
        <br />
        If you have problems please contact Lean#3146 on Discord.
      </>
    ),
  },
  {
    q: "Can we get a sub?",
    a: (
      <>
        You need to play the sets with the 4 people you sign up with. If a
        player becomes unable to play then the rest of the matches need to be
        forfeited.
      </>
    ),
  },
  {
    q: "How do I report a forfeit?",
    a: (
      <>
        You can do on our{" "}
        <MyLink isExternal href="https://discord.gg/sendou">
          Discord
        </MyLink>{" "}
        on the #helpdesk channel.
      </>
    ),
  },
] as const;

const FAQTab = () => {
  return (
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
  );
};

export default FAQTab;
