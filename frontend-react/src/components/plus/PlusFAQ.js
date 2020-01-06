import React, { useState } from "react"
import { Accordion, Icon } from "semantic-ui-react"

const PlusFAQ = () => {
  const [active, setActive] = useState(-1)

  const handleClick = (e, titleProps) => {
    const { index } = titleProps
    const newIndex = active === index ? -1 : index

    setActive(newIndex)
  }

  return (
    <>
      <Accordion>
        <Accordion.Title active={active === 0} index={0} onClick={handleClick}>
          <Icon name="dropdown" />
          <h4 style={{ display: "inline", userSelect: "none" }}>
            What are +1 and +2?
          </h4>
        </Accordion.Title>
        <Accordion.Content active={active === 0}>
          <div style={{ marginLeft: "1.5em" }}>
            They are private Splatoon 2 Discord servers made for LFG purposes.
            Typically people use them to find pick-ups to play with, a team to
            play against in a scrim or just general chatting. All +1 members
            have access to +2 but not the other way around.
          </div>
        </Accordion.Content>
        <Accordion.Title active={active === 1} index={1} onClick={handleClick}>
          <Icon name="dropdown" />
          <h4 style={{ display: "inline", userSelect: "none" }}>
            How can I join?
          </h4>
        </Accordion.Title>
        <Accordion.Content active={active === 1}>
          <div style={{ marginLeft: "1.5em" }}>
            There are two ways to join:
            <ul>
              <li>
                Get suggested by someone already in the server and pass the
                monthly voting
              </li>
              <li>Get vouched by someone who is eligible to do so</li>
            </ul>
          </div>
        </Accordion.Content>
        <Accordion.Title active={active === 2} index={2} onClick={handleClick}>
          <Icon name="dropdown" />
          <h4 style={{ display: "inline", userSelect: "none" }}>
            What is the voting?
          </h4>
        </Accordion.Title>
        <Accordion.Content active={active === 2}>
          <div style={{ marginLeft: "1.5em" }}>
            Every month (first weekend starting on Friday) a voting is held on
            each server to decide the roster. The members vote on each other as
            well as any new suggestions. You need to get 50% or better to get
            access or stay in the server.
          </div>
        </Accordion.Content>
        <Accordion.Title active={active === 3} index={3} onClick={handleClick}>
          <Icon name="dropdown" />
          <h4 style={{ display: "inline", userSelect: "none" }}>
            How is the percentage calculated in the voting?
          </h4>
        </Accordion.Title>
        <Accordion.Content active={active === 3}>
          <div style={{ marginLeft: "1.5em" }}>
            Best score you can get is everyone of your own region giving you +2
            and of the opposite region giving you +1. This would translate to
            100%. Similarly 0% would mean everyone gave you the worst possible
            score. Example of 50% could be a situation where you got -0.5 from
            your own region but +0.5 from the opposite.
          </div>
        </Accordion.Content>
        <Accordion.Title active={active === 4} index={4} onClick={handleClick}>
          <Icon name="dropdown" />
          <h4 style={{ display: "inline", userSelect: "none" }}>
            Why can I only give +1 or -1 to members of the opposite region?
          </h4>
        </Accordion.Title>
        <Accordion.Content active={active === 4}>
          <div style={{ marginLeft: "1.5em" }}>
            This is because due to time zones you typically play the most with
            people living close to your own time zones so you have a better idea
            about those players. The idea is that you have more of a say about
            people who you regularly play with. Of course there are exceptions
            and people might play at odd hours (and indeed not everyone lives in
            Europe or the Americas) but through testing we noticed this system
            gives better results.
          </div>
        </Accordion.Content>
        <Accordion.Title active={active === 5} index={5} onClick={handleClick}>
          <Icon name="dropdown" />
          <h4 style={{ display: "inline", userSelect: "none" }}>
            How does the vouching work?
          </h4>
        </Accordion.Title>
        <Accordion.Content active={active === 5}>
          <div style={{ marginLeft: "1.5em" }}>
            If you got a high score in the latest voting you can vouch someone
            to join a server. For +1 members this ratio is 90% and for +2 80%.
            +1 members can choose to vouch someone to either +1 or +2. If the
            person you vouched gets kicked in their first voting you can't vouch
            anyone for 6 months.
          </div>
        </Accordion.Content>
      </Accordion>
    </>
  )
}

export default PlusFAQ
