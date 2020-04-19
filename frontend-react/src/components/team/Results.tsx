import React, { useContext } from "react"
import Button from "../elements/Button"
import { useState } from "react"
import AddResultModal from "./AddResultModal"
import { TournamentResult } from "../../types"
import { medalEmoji } from "../../assets/imageImports"
import MyThemeContext from "../../themeContext"
import { IconButton, Box } from "@chakra-ui/core"
import { FaTwitter } from "react-icons/fa"
import TweetEmbed from "react-tweet-embed"
import useBreakPoints from "../../hooks/useBreakPoints"
import { ordinal_suffix_of } from "../../utils/helperFunctions"

interface ResultsProps {
  results: TournamentResult[]
  canAddResults: boolean
}

const Results: React.FC<ResultsProps> = ({ results, canAddResults }) => {
  const [showModal, setShowModal] = useState(false)
  const [expandedTweets, setExpandedTweets] = useState<{
    [key: string]: boolean
  }>({})
  const { grayWithShade } = useContext(MyThemeContext)
  const isSmall = useBreakPoints(350)

  return (
    <>
      {showModal && <AddResultModal closeModal={() => setShowModal(false)} />}
      {canAddResults && (
        <Button onClick={() => setShowModal(true)}>
          Add tournament result
        </Button>
      )}
      <Box
        display="grid"
        mt="1em"
        gridTemplateColumns={isSmall ? "repeat(3, 1fr)" : "repeat(4, 1fr)"}
        gridRowGap="1em"
      >
        {results.map((result) => {
          return (
            <React.Fragment key={result.tournament_name}>
              {result.placement < 4 ? (
                <Box
                  maxW="50px"
                  h="auto"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <img
                    src={medalEmoji[result.placement]}
                    alt={`Placement emoji for ${result.placement}`}
                  />
                </Box>
              ) : (
                <Box
                  fontSize="35px"
                  w="50px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
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
                display="flex"
                alignItems="center"
                justifyContent="center"
                textAlign="center"
              >
                {result.tournament_name}
              </Box>
              {!isSmall && (
                <Box
                  color={grayWithShade}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  {new Date(parseInt(result.date)).toLocaleDateString()}
                </Box>
              )}{" "}
              <Box display="flex" alignItems="center" justifyContent="center">
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
              {result.tweet_id && expandedTweets[result.tweet_id] && (
                <>
                  <Box />
                  <TweetEmbed
                    id={result.tweet_id}
                    options={{
                      theme: "dark",
                      dnt: "true",
                      conversation: "none",
                    }}
                  />
                  {!isSmall && <Box />}
                  <Box />
                </>
              )}
            </React.Fragment>
          )
        })}
      </Box>
    </>
  )
}

export default Results
