import React from "react"
import { RouteComponentProps } from "@reach/router"
import Alert from "../elements/Alert"
import Button from "../elements/Button"
import { FaDiscord } from "react-icons/fa"
import { Box } from "@chakra-ui/core"

const Access: React.FC<RouteComponentProps> = () => {
  return (
    <>
      <Alert status="info">
        This part of sendou.ink is restricted. Please log in to confirm access.
      </Alert>
      <Box mt="1em">
        <a href="/auth/discord">
          <Button icon={<FaDiscord />}>Log in via Discord</Button>
        </a>
      </Box>
    </>
  )
}

export default Access
