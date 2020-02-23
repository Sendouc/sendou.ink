import React, { useContext } from "react"
import Button from "../elements/Button"
import { useState } from "react"
import AddResultModal from "./AddResultModal"
import Box from "../elements/Box"
import { TournamentResult } from "../../types"
import { medalEmoji } from "../../assets/imageImports"
import MyThemeContext from "../../themeContext"
import { IconButton } from "@chakra-ui/core"
import { FaTwitter } from "react-icons/fa"
import TweetEmbed from "react-tweet-embed"

interface ResultsProps {
  results: TournamentResult[]
  canAddResults: boolean
}

function ordinal_suffix_of(i: number) {
  var j = i % 10,
    k = i % 100
  if (j === 1 && k !== 11) {
    return "st"
  }
  if (j === 2 && k !== 12) {
    return "nd"
  }
  if (j === 3 && k !== 13) {
    return "rd"
  }
  return "th"
}

const Results: React.FC<ResultsProps> = ({ results, canAddResults }) => {
  const [showModal, setShowModal] = useState(false)
  const [expandedTweets, setExpandedTweets] = useState<{
    [key: string]: boolean
  }>({})
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
            <React.Fragment key={result.tournament_name}>
              <Box display="flex" alignItems="center" my="0.5em">
                {result.placement < 4 ? (
                  <Box maxW="50px" h="auto">
                    <img
                      src={medalEmoji[result.placement]}
                      alt={`Placement emoji for ${result.placement}`}
                    />
                  </Box>
                ) : (
                  <Box fontSize="35px" w="50px">
                    {result.placement}
                    <Box as="span" fontSize="25px">
                      {ordinal_suffix_of(result.placement)}
                    </Box>
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
                <Box>
                  {result.tweet_id && (
                    <IconButton
                      variant="ghost"
                      aria-label="Show tweet"
                      fontSize="20px"
                      icon={FaTwitter}
                      onClick={() =>
                        setExpandedTweets({
                          ...expandedTweets,
                          [result.tweet_id as string]: !expandedTweets[
                            result.tweet_id as string
                          ],
                        })
                      }
                    />
                  )}
                </Box>
              </Box>
              {result.tweet_id && expandedTweets[result.tweet_id] && (
                <TweetEmbed
                  id={result.tweet_id}
                  options={{
                    theme: "dark",
                    dnt: "true",
                    conversation: "none",
                  }}
                />
              )}
            </React.Fragment>
          )
        })}
      </Box>
    </>
  )
}

export default Results
