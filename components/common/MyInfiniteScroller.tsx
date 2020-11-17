// FIXME: this whole file should probably get replaced with something like react-window

import { Flex } from "@chakra-ui/react";
import { ReactElement, ReactNodeArray, useState } from "react";
import InfiniteScroll from "react-infinite-scroller";

const MyInfiniteScroller: React.FC = ({ children }) => {
  const [elementsToShow, setElementsToShow] = useState(12);

  if (!Array.isArray(children))
    throw Error("children for MyInfiniteScroller is not an array");

  return (
    <InfiniteScroll
      pageStart={1}
      loadMore={(page) => setElementsToShow(page * 12)}
      hasMore={elementsToShow < children.length}
    >
      <Flex
        flexWrap="wrap"
        width="100vw"
        position="relative"
        left="50%"
        right="50%"
        mx="-50vw"
        justifyContent="center"
        mt={4}
      >
        {children.slice(0, elementsToShow)}
      </Flex>
    </InfiniteScroll>
  );
};

function getChildrenArray(children: ReactElement): ReactNodeArray {
  if (Array.isArray(children)) return children;
  if (Array.isArray(children?.props.children)) return children.props.children;

  throw Error("children for MyInfiniteScroller is not an array");
}

export default MyInfiniteScroller;
