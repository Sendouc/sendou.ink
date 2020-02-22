import React, { useContext } from "react"
import Button from "../elements/Button"
import { useState } from "react"
import AddResultModal from "./AddResultModal"
import Box from "../elements/Box"
import { TournamentResult } from "../../types"
import { medalEmoji } from "../../assets/imageImports"
import MyThemeContext from "../../themeContext"

interface ResultsProps {
  results: TournamentResult[]
  canAddResults: boolean
}

const Results: React.FC<ResultsProps> = ({ results, canAddResults }) => {
  const [showModal, setShowModal] = useState(false)
  const { grayWithShade } = useContext(MyThemeContext)

  console.log("results", results)
  return (
    <>
      {showModal && <AddResultModal closeModal={() => setShowModal(false)} />}
      {canAddResults && (
        <Button onClick={() => setShowModal(true)}>
          Add tournament result
        </Button>
      )}
      <Box mt="1em">
        {results.map(result => {
          return (
            <Box
              display="flex"
              alignItems="center"
              key={result.tournament_name}
              my="0.5em"
            >
              {result.placement < 4 ? (
                <Box maxW="50px" h="auto">
                  <img src={medalEmoji[result.placement]} />
                </Box>
              ) : (
                <Box fontSize="42px" w="50px">
                  {result.placement}
                </Box>
              )}{" "}
              <Box
                fontWeight="semibold"
                letterSpacing="wide"
                fontSize="24px"
                minWidth="150px"
                px="0.5em"
                textAlign="center"
                justifyContent="center"
              >
                {result.tournament_name}
              </Box>
              <Box color={grayWithShade}>
                {new Date(parseInt(result.date)).toLocaleDateString()}
              </Box>{" "}
            </Box>
          )
        })}
      </Box>
    </>
  )
}

export default Results
