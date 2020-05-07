import { Box, Flex } from "@chakra-ui/core"
import React from "react"

//https://stackoverflow.com/a/19303725
function seededRandom(seed: number) {
  var x = Math.sin(seed++) * 10000
  return x - Math.floor(x)
}

//https://stackoverflow.com/a/23603772
function getRandomColor(runningNumber: number, l: number) {
  const color = "hsl(" + seededRandom(runningNumber) * 360 + `, 100%, ${l}%)`
  return color
}

//https://codepen.io/chrisgresh/pen/aNjovb
function getRandomGradient(runningNumber: number) {
  const newColor1 = getRandomColor(runningNumber, 20)
  const newColor2 = getRandomColor(runningNumber, 80)
  const angle = Math.round(seededRandom(runningNumber) * 360)

  return (
    "linear-gradient(" + angle + "deg, " + newColor1 + ", " + newColor2 + ")"
  )
}

interface InTheZoneBannerProps {
  runningNumber: number
}

const InTheZoneBanner: React.FC<InTheZoneBannerProps> = ({ runningNumber }) => {
  return (
    <Flex
      justifyContent="center"
      alignItems="center"
      backgroundImage={getRandomGradient(runningNumber)}
      borderRadius="5px"
      p="40px"
      color="black"
    >
      <img
        src="https://abload.de/img/itz_main_logog7jls.png"
        style={{ width: "128px" }}
        alt="In The Zone logo"
      />
      <Box fontSize="70px" fontWeight="bolder" ml="0.2em">
        {runningNumber}
      </Box>
    </Flex>
  )
}

export default InTheZoneBanner
