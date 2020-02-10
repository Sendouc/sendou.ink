import React from "react"
import Button from "../elements/Button"
import { useState } from "react"
import AddResultModal from "./AddResultModal"

interface ResultsProps {
  canAddResults: boolean
}

const Results: React.FC<ResultsProps> = ({ canAddResults }) => {
  const [showModal, setShowModal] = useState(false)
  return (
    <>
      {showModal && <AddResultModal closeModal={() => setShowModal(false)} />}
      {canAddResults && (
        <Button onClick={() => setShowModal(true)}>
          Add tournament result
        </Button>
      )}
    </>
  )
}

export default Results
