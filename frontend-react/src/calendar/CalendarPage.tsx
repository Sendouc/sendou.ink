import React, { useState, useEffect, useRef } from "react"
import jstz from "jstz"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverCloseButton,
  PopoverBody,
  Box,
  Link,
  Icon,
} from "@chakra-ui/core"
import { RouteComponentProps } from "@reach/router"
import { useContext } from "react"
import MyThemeContext from "../themeContext"
import PageHeader from "../components/common/PageHeader"
import { Helmet } from "react-helmet-async"
import Button from "../components/elements/Button"

const CalendarPage: React.FC<RouteComponentProps> = () => {
  const {
    themeColor,
    darkerBgColor,
    themeColorWithShade,
    grayWithShade,
  } = useContext(MyThemeContext)
  const [showCode, setShowCode] = useState(false)
  const calenderDiv = useRef<HTMLDivElement | null>(null)

  const iFrameHTML = `<iframe title="calendar" src="https://calendar.google.com/calendar/embed?height=600&amp;wkst=2&amp;bgcolor=%23ffffff&amp;src=NDNnYnJlamkxbnQyZTY1dWJuZzdvYWkxZGtAZ3JvdXAuY2FsZW5kYXIuZ29vZ2xlLmNvbQ&amp;color=%23E67C73&amp;showTitle=0&amp;showNav=1&amp;showDate=1&amp;showPrint=0&amp;showCalendars=0&amp;ctz=${jstz
    .determine()
    .name()}" style=border-width: 0 width=${"90%"} height="1000" frameBorder="0" scrolling="no"></iframe>`

  //This is a weird solution but I couldn't get it working just setting the iframe src from a variable
  useEffect(() => {
    if (!calenderDiv?.current) return
    calenderDiv.current.innerHTML = iFrameHTML
  }, [iFrameHTML])

  return (
    <>
      <Helmet>
        <title>Competitive Calendar | sendou.ink</title>
      </Helmet>
      <PageHeader title="Competitive Calendar" />
      <Popover placement="top-start">
        <PopoverTrigger>
          <Box mt="1em">
            <Button outlined onClick={() => setShowCode(!showCode)}>
              Show emoji code
            </Button>
          </Box>
        </PopoverTrigger>
        <PopoverContent zIndex={4} background={darkerBgColor} width="280px">
          <PopoverArrow />
          <PopoverCloseButton />
          <PopoverBody>
            <h4>
              <span role="img" aria-label="money bag emoji">
                💰
              </span>{" "}
              - Has prizes
              <br />
              <span role="img" aria-label="masks emoji">
                🎭
              </span>{" "}
              - Unconventional ruleset
              <br />
              <span role="img" aria-label="lock emoji">
                🔒
              </span>{" "}
              - Limited registration
              <br />
              <span role="img" aria-label="handshake emoji">
                🤝
              </span>{" "}
              - Local event
              <br />
              <span role="img" aria-label="dice emoji">
                🎲
              </span>{" "}
              - Solo registration available
              <br />
              <span role="img" aria-label="eyes emoji">
                👀
              </span>{" "}
              - No open registration
            </h4>
          </PopoverBody>
        </PopoverContent>
      </Popover>
      <Box mt="2em" ref={calenderDiv} />
      <Box mt="2em" color={grayWithShade}>
        If an event is missing you can contact{" "}
        <Link
          href="https://twitter.com/Kbot_273"
          color={themeColorWithShade}
          isExternal
        >
          Kbot <Icon name="external-link" mx="2px" />
        </Link>{" "}
        about it.
        <br />
        You can add the calendar to your personal Google Calendar by pressing
        the plus button above. If you are using other kind of calendar program
        you can try{" "}
        <Link
          href="https://calendar.google.com/calendar/ical/43gbreji1nt2e65ubng7oai1dk%40group.calendar.google.com/public/basic.ics"
          color={themeColorWithShade}
          isExternal
        >
          this link <Icon name="external-link" mx="2px" />
        </Link>{" "}
        instead.
      </Box>
    </>
  )
}

export default CalendarPage
