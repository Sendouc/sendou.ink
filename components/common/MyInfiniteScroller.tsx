import InfiniteScroll from "react-infinite-scroller";

interface Props {}

const MyInfiniteScroller: React.FC<Props> = ({}) => {
  return (
    <InfiniteScroll
      pageStart={1}
      loadMore={(page) => setBuildsToShow(page * 10)}
      hasMore={buildsToShow < data.searchForBuilds.length}
    ></InfiniteScroll>
  );
};

export default MyInfiniteScroller;
