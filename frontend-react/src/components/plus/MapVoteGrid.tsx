import React, { useContext } from "react"
import { Grid, Box, Avatar, Flex } from "@chakra-ui/core"
import { mapIcons } from "../../assets/imageImports"
import MyThemeContext from "../../themeContext"

interface MapVoteGridProps {
  votes: {
    name: string
    sz: -1 | 0 | 1
    tc: -1 | 0 | 1
    rm: -1 | 0 | 1
    cb: -1 | 0 | 1
  }[]
  setVotes: React.Dispatch<
    React.SetStateAction<
      {
        name: string
        sz: 0 | 1 | -1
        tc: 0 | 1 | -1
        rm: 0 | 1 | -1
        cb: 0 | 1 | -1
      }[]
    >
  >
}

const getBg = (value: number) => {
  if (value === 0) {
    return "yellow.500"
  } else if (value === 1) {
    return "green.500"
  }

  return "red.500"
}

interface VotingButtonProps {
  value: 1 | 0 | -1
  handleClick: (oldValue: number) => void
  gridArea: string
  mode: string
}

const VotingButton: React.FC<VotingButtonProps> = ({
  value,
  handleClick,
  gridArea,
  mode,
}) => {
  return (
    <Flex
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      gridArea={gridArea}
    >
      <Box fontWeight="semibold" letterSpacing="wide">
        {mode}
      </Box>
      <Flex
        onClick={() => handleClick(value)}
        alignItems="center"
        justifyContent="center"
        borderRadius="50%"
        w="50px"
        h="50px"
        fontWeight="bolder"
        border="4px solid"
        borderColor={getBg(value)}
        fontSize="24px"
        cursor="pointer"
        userSelect="none"
      >
        {value > 0 ? "+" : ""}
        {value}
      </Flex>
    </Flex>
  )
}

const MapVoteGrid: React.FC<MapVoteGridProps> = ({ votes, setVotes }) => {
  const { grayWithShade } = useContext(MyThemeContext)

  const handleClick = (
    stageIndex: number,
    mode: "sz" | "tc" | "rm" | "cb",
    oldValue: number
  ) => {
    let newValue = oldValue + 1
    if (newValue > 1) {
      newValue = -1
    }
    const copyOfVotes = [...votes]
    copyOfVotes[stageIndex][mode] = newValue as -1 | 0 | 1

    setVotes(copyOfVotes)
  }
  return (
    <>
      {votes.map((stage, index) => {
        return (
          <Grid
            key={stage.name}
            gridTemplateColumns="repeat(4, 1fr)"
            gridTemplateRows="repeat(2, 1fr)"
            my="1em"
            rounded="lg"
            overflow="hidden"
            boxShadow="0px 0px 16px 6px rgba(0,0,0,0.1)"
            p="10px"
          >
            <Flex
              gridArea="1 / 1 / 2 / 5"
              justifyContent="center"
              alignItems="center"
              flexDirection="column"
            >
              <Avatar
                src={mapIcons[stage.name]}
                size="lg"
                my="5px"
                mr="0.5em"
              />

              <Box
                color={grayWithShade}
                fontWeight="semibold"
                letterSpacing="wide"
                mx="0.5em"
              >
                {stage.name}
              </Box>
            </Flex>
            <VotingButton
              value={stage.sz}
              handleClick={(oldValue: number) =>
                handleClick(index, "sz", oldValue)
              }
              mode="SZ"
              gridArea="2 / 1 / 3 / 2"
            />
            <VotingButton
              value={stage.tc}
              handleClick={(oldValue: number) =>
                handleClick(index, "tc", oldValue)
              }
              mode="TC"
              gridArea="2 / 2 / 3 / 3"
            />
            <VotingButton
              value={stage.rm}
              handleClick={(oldValue: number) =>
                handleClick(index, "rm", oldValue)
              }
              mode="RM"
              gridArea="2 / 3 / 3 / 4"
            />
            <VotingButton
              value={stage.cb}
              handleClick={(oldValue: number) =>
                handleClick(index, "cb", oldValue)
              }
              mode="CB"
              gridArea="2 / 4 / 3 / 5"
            />
          </Grid>
        )
      })}
    </>
  )
}

export default MapVoteGrid
