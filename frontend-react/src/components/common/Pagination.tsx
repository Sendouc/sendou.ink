import React from "react"
import "./Pagination.css"
import ReactPaginate from "react-paginate"

interface PaginationProps {
  pageCount: number
  currentPage: number
  onChange: (page: number) => void
}

const Pagination: React.FC<PaginationProps> = ({
  pageCount,
  onChange,
  currentPage,
}) => {
  return (
    <ReactPaginate
      previousLabel={<>&laquo;</>}
      nextLabel={<>&raquo;</>}
      breakLabel={"..."}
      breakClassName={"page"}
      pageCount={pageCount}
      marginPagesDisplayed={2}
      pageRangeDisplayed={3}
      onPageChange={({ selected }) => onChange(selected + 1)}
      forcePage={currentPage - 1}
      containerClassName="pagination"
      pageClassName="page"
      previousClassName="page"
      nextClassName="page"
      pageLinkClassName="page"
      activeLinkClassName="active-page"
      disabledClassName="disabled-page"
      activeClassName={"active"}
    />
  )
}

export default Pagination
