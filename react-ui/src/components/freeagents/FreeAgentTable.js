import React, { useState } from "react"
import { Table } from "semantic-ui-react"
import FATableRows from "./FATableRows"
import InfiniteScroll from "react-infinite-scroller"

const FreeAgentTable = ({ FAArray }) => {
  const [postsToShow, setPostsToShow] = useState(20)

  const loadMorePosts = page => {
    setPostsToShow(page * 20)
  }

  const visiblePosts = FAArray.filter((post, index) => index < postsToShow)

  return (
    <InfiniteScroll
      pageStart={1}
      loadMore={loadMorePosts}
      hasMore={postsToShow < FAArray.length}
      loader={null}
    >
      <Table basic="very" fixed>
        <Table.Body>
          {visiblePosts.map(fa => {
            return <FATableRows key={fa.id} freeAgent={fa} />
          })}
        </Table.Body>
      </Table>
    </InfiniteScroll>
  )
}

export default FreeAgentTable
