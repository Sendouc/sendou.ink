import React, { useState } from "react"
import { FreeAgentPost } from "../../types"
import { Grid, Box, Heading } from "@chakra-ui/core"
import Alert from "../elements/Alert"
import FreeAgentCard from "./FreeAgentCard"
import InfiniteScroll from "react-infinite-scroller"
import Button from "../elements/Button"

interface PostsAccordionProps {
  posts: FreeAgentPost[]
}

const Posts: React.FC<PostsAccordionProps> = ({ posts }) => {
  const [agentsToShow, setAgentsToShow] = useState(5)

  if (posts.length === 0) {
    return (
      <Alert status="info">No free agents found with the current filter</Alert>
    )
  }
  return (
    <>
      <Grid gridTemplateColumns="repeat(auto-fit, minmax(260px, 1fr))" mt="1em">
        <InfiniteScroll
          pageStart={1}
          loadMore={page => setAgentsToShow(page * 10)}
          hasMore={agentsToShow < posts.length}
        >
          {posts
            .filter((post, index) => index < agentsToShow)
            .map(post => (
              <Box my="1em">
                <FreeAgentCard key={post.id} post={post} />
              </Box>
            ))}
        </InfiniteScroll>
      </Grid>
      <Box w="50%" textAlign="center" mx="auto" mt="1em">
        <Heading size="sm">No more free agents to show</Heading>
        <Box mt="1em">
          <Button outlined onClick={() => window.scrollTo(0, 0)}>
            Return to the top
          </Button>
        </Box>
      </Box>
    </>
  )
}

export default Posts
