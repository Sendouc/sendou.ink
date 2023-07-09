import * as React from "react";

export function useSimplePagination<T>({
  items,
  pageSize,
}: {
  items: T[];
  pageSize: number;
}) {
  const [currentPage, setCurrentPage] = React.useState(1);
  const pagesCount = Math.ceil(items.length / pageSize);

  const itemsToDisplay = React.useMemo(
    () => items.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [currentPage, items, pageSize]
  );

  const nextPage = React.useCallback(() => {
    if (currentPage < pagesCount) {
      setCurrentPage((prev) => prev + 1);
      window.scrollTo(0, 0);
    }
  }, [currentPage, pagesCount]);

  const previousPage = React.useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
      window.scrollTo(0, 0);
    }
  }, [currentPage]);

  const thereIsNextPage = currentPage < pagesCount;
  const thereIsPreviousPage = currentPage > 1;

  return {
    pagesCount,
    currentPage,
    itemsToDisplay,
    nextPage,
    previousPage,
    thereIsNextPage,
    thereIsPreviousPage,
    everythingVisible: items.length === itemsToDisplay.length,
  };
}
