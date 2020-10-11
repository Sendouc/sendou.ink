import { Button } from "@chakra-ui/core";
import React from "react";
import { useTranslation } from "react-i18next";
import ReactPaginate from "react-paginate";
import "./Pagination.css";

interface PaginationProps {
  pageCount: number;
  currentPage: number;
  onChange: (page: number) => void;
  scrollToTop?: boolean;
}

const Pagination: React.FC<PaginationProps> = ({
  pageCount,
  onChange,
  currentPage,
  scrollToTop = false,
}) => {
  const { t } = useTranslation();

  return (
    <ReactPaginate
      previousLabel={
        <Button my={2} disabled={currentPage === 1} size="sm">
          {t("navigation;paginationPrevious")}
        </Button>
      }
      nextLabel={
        <Button
          my={2}
          disabled={currentPage === pageCount || !pageCount}
          size="sm"
        >
          {t("navigation;paginationNext")}
        </Button>
      }
      breakLabel="..."
      breakClassName="page"
      pageCount={pageCount}
      marginPagesDisplayed={2}
      pageRangeDisplayed={3}
      onPageChange={({ selected }) => {
        onChange(selected + 1);
        if (scrollToTop) window.scrollTo(0, 0);
      }}
      forcePage={currentPage - 1}
      containerClassName="pagination"
      pageClassName="page"
      previousClassName="page"
      nextClassName="page"
      pageLinkClassName="page"
      activeLinkClassName="active-page"
      disabledClassName="disabled-page"
      activeClassName="active"
    />
  );
};

export default Pagination;
