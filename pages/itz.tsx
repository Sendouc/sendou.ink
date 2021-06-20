/* eslint-disable */

import { Box, Button, Flex, Heading } from "@chakra-ui/react";
import { useState } from "react";
import MyHead from "../components/common/MyHead";

//https://stackoverflow.com/a/19303725
function seededRandom(seed: number) {
  var x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

//https://stackoverflow.com/a/23603772
function getRandomColor(runningNumber: number, l: number) {
  const color = "hsl(" + seededRandom(runningNumber) * 360 + `, 100%, ${l}%)`;
  return color;
}

//https://codepen.io/chrisgresh/pen/aNjovb
function getRandomGradient(runningNumber: number) {
  const newColor1 = getRandomColor(runningNumber, 20);
  const newColor2 = getRandomColor(runningNumber, 80);
  const angle = Math.round(seededRandom(runningNumber) * 360);

  return (
    "linear-gradient(" + angle + "deg, " + newColor1 + ", " + newColor2 + ")"
  );
}

interface InTheZoneBannerProps {
  runningNumber: number;
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
        // eslint-disable-line @next/next/no-img-element
        src="https://abload.de/img/itz_main_logog7jls.png"
        style={{ width: "128px" }}
        alt="In The Zone logo"
      />
      <Box fontSize="70px" fontWeight="bolder" ml="0.2em">
        {runningNumber}
      </Box>
    </Flex>
  );
};

const EventsPage = () => {
  const [runningNumber, setRunningNumber] = useState(20);
  return (
    <>
      <MyHead title="In The Zone" />
      <Box>
        <Heading size="lg" textAlign="center">
          In The Zone
        </Heading>
        <Heading
          size="md"
          fontWeight="hairline"
          letterSpacing="0.1em"
          textAlign="center"
          mb="1em"
        >
          The premier western Splat Zones tournament
        </Heading>
        <InTheZoneBanner runningNumber={runningNumber} />
        <Flex mt="2em">
          <Button onClick={() => setRunningNumber(runningNumber - 1)}>
            Minus
          </Button>
          <Button onClick={() => setRunningNumber(runningNumber + 1)}>
            Plus
          </Button>
        </Flex>
      </Box>
    </>
  );
};

export default EventsPage;
