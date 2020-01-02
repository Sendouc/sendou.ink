import React from "react"
import { Button } from "semantic-ui-react"

const VotingNumber = ({ number, selected, onClick }) => {
  const color = () => {
    if (!selected) return "grey"
    if (number === 2) return "green"
    if (number === -2) return "red"

    return null
  }
  const style = () => {
    if (!selected || number === 2 || number === -2) return {}
    else if (number === -1) return { background: "#FFA07A" }
    else if (number === 1) return { background: "#90EE90" }
  }
  return (
    <Button color={color()} style={style()} circular onClick={onClick}>
      {number > 0 && "+"}
      {number}
    </Button>
  )
}

export default VotingNumber
