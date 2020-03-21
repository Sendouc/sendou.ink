import React from "react"
import { Flex, Icon, Box } from "@chakra-ui/core"

//https://stackoverflow.com/a/9083076
function romanize(num: number) {
  if (isNaN(num)) return NaN
  let digits = String(+num).split(""),
    key = [
      "",
      "C",
      "CC",
      "CCC",
      "CD",
      "D",
      "DC",
      "DCC",
      "DCCC",
      "CM",
      "",
      "X",
      "XX",
      "XXX",
      "XL",
      "L",
      "LX",
      "LXX",
      "LXXX",
      "XC",
      "",
      "I",
      "II",
      "III",
      "IV",
      "V",
      "VI",
      "VII",
      "VIII",
      "IX",
    ],
    roman = "",
    i = 3
  while (i--) roman = (key[+digits.pop()! + i * 10] || "") + roman
  return Array(+digits.join("") + 1).join("M") + roman
}

//https://stackoverflow.com/a/23603772
function getRandomColor(runningNumber: number) {
  const color = "hsl(" + random(runningNumber) * 360 + ", 100%, 75%)"
  return color
}

//https://stackoverflow.com/a/19303725
function random(seed: number) {
  var x = Math.sin(seed++) * 10000
  return x - Math.floor(x)
}

interface InTheZoneBannerProps {
  runningNumber: number
}

const InTheZoneBanner: React.FC<InTheZoneBannerProps> = ({ runningNumber }) => {
  return (
    <Flex
      justifyContent="center"
      alignItems="center"
      bg={getRandomColor(runningNumber)}
      borderRadius="5px"
      p="40px"
      color="black"
    >
      <Icon size="128px" name={"itz" as any} />
      <Box fontSize="70px" fontWeight="bolder" ml="0.2em">
        {runningNumber}
      </Box>
    </Flex>
  )
}

export default InTheZoneBanner
