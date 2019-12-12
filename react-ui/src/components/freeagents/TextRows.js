import React from "react"
import { Table } from "semantic-ui-react"

const TextRows = ({ freeAgent }) => {
  const { activity, description, looking_for, past_experience } = freeAgent

  const hiddenBorder = { borderStyle: "hidden" }
  return (
    <>
      {activity && (
        <>
          <Table.Row>
            <Table.Cell style={hiddenBorder}></Table.Cell>
            <Table.Cell colSpan={4} style={hiddenBorder}>
              <h4>Activity</h4>
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell></Table.Cell>
            <Table.Cell colSpan={4}>{activity}</Table.Cell>
          </Table.Row>
        </>
      )}
      {past_experience && (
        <>
          <Table.Row style={hiddenBorder}>
            <Table.Cell style={hiddenBorder}></Table.Cell>
            <Table.Cell colSpan={4} style={{ borderStyle: "hidden" }}>
              <h4>Past experience</h4>
            </Table.Cell>
          </Table.Row>
          <Table.Row style={{ border: "0" }}>
            <Table.Cell></Table.Cell>
            <Table.Cell colSpan={4}>{past_experience}</Table.Cell>
          </Table.Row>
        </>
      )}
      {looking_for && (
        <>
          <Table.Row>
            <Table.Cell style={hiddenBorder}></Table.Cell>
            <Table.Cell colSpan={4} style={hiddenBorder}>
              <h4>Looking for</h4>
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell></Table.Cell>
            <Table.Cell colSpan={4}>{looking_for}</Table.Cell>
          </Table.Row>
        </>
      )}
      {description && (
        <>
          <Table.Row>
            <Table.Cell style={hiddenBorder}></Table.Cell>
            <Table.Cell colSpan={4} style={hiddenBorder}>
              <h4>Description</h4>
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell></Table.Cell>
            <Table.Cell colSpan={4} style={{ whiteSpace: "pre-wrap" }}>
              {description}
            </Table.Cell>
          </Table.Row>
        </>
      )}
    </>
  )
}

export default TextRows
