import React from "react"
import { Table } from "semantic-ui-react"
import FATableRows from "./FATableRows"

const FreeAgentTable = ({ FAArray }) => {
  return (
    <Table basic="very">
      <Table.Body>
        {FAArray.map(fa => {
          return <FATableRows key={fa.id} freeAgent={fa} />
        })}
      </Table.Body>
    </Table>
  )
}

export default FreeAgentTable
