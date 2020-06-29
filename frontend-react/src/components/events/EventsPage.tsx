import React, { useState } from "react"
import { RouteComponentProps } from "@reach/router"
import InTheZoneBanner from "./InTheZoneBanner"
import { Box, Flex, Heading } from "@chakra-ui/core"
import Button from "../elements/Button"

const EventsPage: React.FC<RouteComponentProps> = () => {
  const [runningNumber, setRunningNumber] = useState(10)
  return (
    <>
      <Box>
        <Heading size="lg" textAlign="center">
          In The Zone
        </Heading>
        <Heading
          size="md"
          fontWeight="hairline"
          letterSpacing="0.1em"
          textAlign="center"
          mb="1em"
        >
          The premier western Splat Zones tournament
        </Heading>
        <InTheZoneBanner runningNumber={runningNumber} />
        <Flex mt="2em">
          <Button onClick={() => setRunningNumber(runningNumber - 1)}>
            Minus
          </Button>
          <Button onClick={() => setRunningNumber(runningNumber + 1)}>
            Plus
          </Button>
        </Flex>
      </Box>
    </>
  )
}

export default EventsPage
