import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Link,
} from "@chakra-ui/core"
import { RouteComponentProps } from "@reach/router"
import React, { useContext } from "react"
import { Helmet } from "react-helmet-async"
import MyThemeContext from "../../themeContext"
import PageHeader from "../common/PageHeader"

export const PlusFAQPage: React.FC<RouteComponentProps> = () => {
  const { themeColorWithShade, darkerBgColor } = useContext(MyThemeContext)

  const questionsAndAnswers = [
    {
      question: "What is the Plus Server?",
      answer: (
        <>
          Plus Server is a{" "}
          <Link color={themeColorWithShade} href="https://discord.gg/FW4dKrY">
            Discord server
          </Link>{" "}
          you can use to look for players to play with. <br />
          <br />
          There are also exclusive categories referred to as "+1" and "+2" meant
          for stronger players. +1 and +2 have their own LFG and scrim channels
          as well as exclusive monthly Draft Cup. Every +1 player has access to
          +2 but not vice versa.
        </>
      ),
    },
    {
      question: "How can I join +1/+2?",
      answer: (
        <>
          There are two ways to join +1 and +2:
          <br />
          <br />
          1) pass the voting <br />
          <br />
          or
          <br />
          <br />
          2) get vouched.
        </>
      ),
    },
    {
      question: "How does the voting work?",
      answer: (
        <>
          On the first weekend of each month (counted from first Friday) a
          voting is held. For current members of +1 and +2 they need a score of
          50% or better to stay in the category. If you get voted out from +1
          you still have access to +2 next month.
          <br />
          <br />
          Suggested players for the month are also included in the voting. For
          suggested players they need a score better than 50% to gain access to
          the category.
          <br />
          <br />
          Voting is divided into two regions: North American and Europe. Players
          who don't live in either of these regions are included in the region
          they play more with. In the voting you choose -2, -1, +1 or +2 for
          each member and suggestion of the category in your own region and -1
          or +1 for the other region.
          <br />
          <br />
          At the end the results are tallied up in a way where you get 0% if
          everyone gave you the worst possible score and 100% if everyone gave
          you the best possible with linear progression in between.
        </>
      ),
    },
    {
      question: "How do I get suggested and pass the voting?",
      answer: (
        <>
          Every member of +1 and +2 has one suggestion available for them to use
          each month. It's up to each member to decide how to use it just like
          it's up for people to decide on how to vote. However here are some
          observations on how people typically succeed in this.
          <br />
          <br />
          Get notified with your skill. By far the best way is to do really well
          in bigger tournaments. Getting high placements in solo queue can also
          be a factor.
          <br />
          <br />
          In general it's important that people voting know you. You should be
          proactive in seeking to play pickups. Even without access to some
          Discord channel you can still message people to play with you.
          <br />
          <br />
          Be in good standing in the community. Simply put it doesn't matter how
          good you are if people don't want to play with you.
        </>
      ),
    },
    {
      question: "How does vouching work?",
      answer: (
        <>
          Members who get a high score in the voting (80% or better for +2 and
          90% or better for +1) can vouch a player to join the category right
          away. They are included in the next voting normally. If they get
          kicked in their first voting the voucher needs to wait 6 months before
          making another vouch.
          <br />
          <br />
          Note that while +1 players can vouch a player for +2 too if they wish
          they will still require the 90% or better score to do so.
        </>
      ),
    },
  ]

  return (
    <>
      <Helmet>
        <title>Plus Server FAQ | sendou.ink</title>
      </Helmet>
      <PageHeader title="Plus Server FAQ" />
      <Accordion allowToggle>
        {questionsAndAnswers.map((qa) => (
          <AccordionItem key={qa.question}>
            <AccordionButton>
              <Box flex="1" textAlign="left">
                {qa.question}
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel bg={darkerBgColor} pb={4}>
              {qa.answer}
            </AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>
    </>
  )
}

export default PlusFAQPage
