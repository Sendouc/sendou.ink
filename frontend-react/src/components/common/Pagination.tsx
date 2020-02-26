import React, { useContext } from "react"
import "./Pagination.css"
import { Box } from "@chakra-ui/core"
import MyThemeContext from "../../themeContext"

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
    <Box className="pagination">
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
      {[...Array(6)].map((page, index) => {
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
    </Box>
  )
}

export default Pagination
