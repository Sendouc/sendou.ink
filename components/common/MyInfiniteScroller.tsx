import { Flex } from "@chakra-ui/react";
import { useState } from "react";
import InfiniteScroll from "react-infinite-scroller";

const ON_PAGE = 6;

const MyInfiniteScroller: React.FC = ({ children }) => {
  const [elementsToShow, setElementsToShow] = useState(ON_PAGE);

  if (!Array.isArray(children))
    throw Error("children for MyInfiniteScroller is not an array");

  return (
    <InfiniteScroll
      pageStart={1}
      loadMore={(page) => setElementsToShow(page * ON_PAGE)}
      hasMore={elementsToShow < children.length}
    >
      <Flex flexWrap="wrap" justifyContent="center" mt={4}>
        {children.slice(0, elementsToShow)}
      </Flex>
    </InfiniteScroll>
  );
};

export default MyInfiniteScroller;
