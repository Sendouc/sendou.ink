import { Box, Flex, Grid, IconButton, useMediaQuery } from "@chakra-ui/react";
import { useMyTheme } from "hooks/common";
import { ReactNode } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const daysInMonth = (month: number, year: number): number[] => {
  const monthZeroIndex = month - 1;
  const date = new Date(year, monthZeroIndex, 1);

  const result = [];
  while (date.getMonth() === monthZeroIndex) {
    result.push(date.getDate());
    date.setDate(date.getDate() + 1);
  }
  return result;
};

const emptyDaysCount = (currentDate: Date): number => {
  return [6, 0, 1, 2, 3, 4, 5, 6][currentDate.getDay()];
};

const isToday = (date: Date) => {
  const now = new Date();

  return (
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  );
};

type MonthYear = { month: number; year: number };

const Square = ({ children }: { children?: ReactNode }) => {
  const { gray } = useMyTheme();
  return (
    <Box color={gray} fontSize="small" fontWeight="bold">
      {children}
    </Box>
  );
};

const Calendar = ({
  current,
  min,
  handleBackClick,
  handleNextClick,
  showNextButton,
  dateContents,
}: {
  current: MonthYear;
  min: MonthYear;
  handleBackClick: () => void;
  handleNextClick: () => void;
  showNextButton: boolean;
  dateContents: Record<string, ReactNode>;
}) => {
  const { themeColorHex } = useMyTheme();
  const [noSideNav] = useMediaQuery("(max-width: 991px)");
  const currentDate = new Date(current.year, current.month - 1, 1);

  return (
    <Box
      display="inline-block"
      textAlign="center"
      overflowX="auto"
      width={noSideNav ? "100vw" : "calc(100vw - 250px)"}
    >
      <Flex justify="space-evenly">
        <IconButton
          aria-label="Go back a month"
          variant="ghost"
          color="current"
          icon={<FiChevronLeft />}
          borderRadius="50%"
          float="left"
          size="lg"
          onClick={handleBackClick}
          visibility={
            current.month === min.month && current.year === min.year
              ? "hidden"
              : "visible"
          }
        />
        <Box>
          {currentDate.toLocaleDateString("en", { month: "long" })}
          <br />
          <b>{current.year}</b>
        </Box>
        <IconButton
          aria-label="Go forward a month"
          variant="ghost"
          color="current"
          icon={<FiChevronRight />}
          borderRadius="50%"
          float="right"
          size="lg"
          onClick={handleNextClick}
          visibility={showNextButton ? "visible" : "hidden"}
        />
      </Flex>

      <Grid
        templateColumns="repeat(7, max(14%, 125px))"
        gridAutoRows="1fr"
        gridRowGap="0.5rem"
        gridColumnGap="0.25rem"
        mt="1rem"
      >
        <Square>Mo</Square>
        <Square>Tu</Square>
        <Square>We</Square>
        <Square>Th</Square>
        <Square>Fr</Square>
        <Square>Sa</Square>
        <Square>Su</Square>
        {new Array(emptyDaysCount(currentDate)).fill(null).map((_, i) => (
          <Square key={i}></Square>
        ))}
        {daysInMonth(current.month, current.year).map((day) => (
          <Square key={day}>
            <Box
              as="span"
              display="inline-block"
              boxShadow={
                isToday(new Date(current.year, current.month - 1, day))
                  ? `inset 0px -2px 0px 0px ${themeColorHex}`
                  : undefined
              }
            >
              {day}
            </Box>
            {dateContents[`${day}-${current.month}-${current.year}`]}
          </Square>
        ))}
      </Grid>
    </Box>
  );
};

export default Calendar;
