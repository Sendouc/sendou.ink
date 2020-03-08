import React, { useContext } from "react"
import "./Pagination.css"
import { Box } from "@chakra-ui/core"
import MyThemeContext from "../../themeContext"
import ReactPaginate from "react-paginate"

interface PaginationProps {
  pageCount: number
  currentPage: number
  onChange: (page: number) => void
}

const Pagination: React.FC<PaginationProps> = ({
  pageCount,
  currentPage,
  onChange,
}) => {
  const { colorMode, themeColorHex } = useContext(MyThemeContext)
  return (
    <>
      {/*<Box className="pagination">
      <Box
        as="span"
        style={{
          color: colorMode === "light" ? "black" : "white",
          borderBottomColor: themeColorHex,
        }}
        onClick={() => onChange(currentPage === 1 ? 1 : currentPage - 1)}
      >
        &laquo;
      </Box>
      {[...Array(Math.min(pageCount, 6))].map((page, index) => {
        const pageNumber = index + currentPage
        return (
          <Box
            as="span"
            className={pageNumber === currentPage ? "active" : undefined}
            style={{
              color: colorMode === "light" ? "black" : "white",
              borderBottomColor: themeColorHex,
            }}
            key={pageNumber}
            onClick={() => onChange(pageNumber)}
          >
            {pageNumber}
          </Box>
        )
      })}

      <Box
        as="span"
        style={{
          color: colorMode === "light" ? "black" : "white",
          borderBottomColor: themeColorHex,
        }}
        onClick={() =>
          onChange(currentPage === pageCount ? pageCount : currentPage + 1)
        }
      >
        &raquo;
      </Box>
      </Box>*/}
      <ReactPaginate
        previousLabel={<>&laquo;</>}
        nextLabel={<>&raquo;</>}
        breakLabel={"..."}
        breakClassName={"page"}
        pageCount={pageCount}
        marginPagesDisplayed={2}
        pageRangeDisplayed={3}
        onPageChange={({ selected }) => onChange(selected)}
        containerClassName="pagination"
        pageClassName="page"
        previousClassName="page"
        nextClassName="page"
        pageLinkClassName="page"
        activeLinkClassName="active-page"
        disabledClassName="disabled-page"
        //subContainerClassName={'pages pagination'}
        activeClassName={"active"}
      />
    </>
  )
}

export default Pagination
