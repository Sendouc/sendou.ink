import React, { useContext } from "react"
import "./Pagination.css"
import { Box } from "@chakra-ui/core"
import { Link } from "@reach/router"
import MyThemeContext from "../../themeContext"

interface PaginationProps {}

const Pagination: React.FC<PaginationProps> = ({}) => {
  const { colorMode, themeColorHex } = useContext(MyThemeContext)
  return (
    <Box className="pagination">
      <Link to="/" style={{ color: colorMode === "light" ? "black" : "white" }}>
        &laquo;
      </Link>
      <Link to="/" style={{ color: colorMode === "light" ? "black" : "white" }}>
        1
      </Link>
      <Link
        to="/"
        className="active"
        style={{
          color: colorMode === "light" ? "black" : "white",
          borderBottomColor: themeColorHex,
        }}
      >
        2
      </Link>
      <Link to="/" style={{ color: colorMode === "light" ? "black" : "white" }}>
        &raquo;
      </Link>
    </Box>
  )
}

export default Pagination
