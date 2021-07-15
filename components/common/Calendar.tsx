import { Box, Grid, IconButton } from "@chakra-ui/react";
import { useMyTheme } from "hooks/common";
import { ReactNode } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import styles from "./Calendar.module.css";

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
  const { gray, secondaryBgColor } = useMyTheme();
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
  dateContents,
}: {
  current: MonthYear;
  min: MonthYear;
  handleBackClick: () => void;
  handleNextClick: () => void;
  dateContents: Record<string, ReactNode>;
}) => {
  const { themeColorHex } = useMyTheme();
  const currentDate = new Date(current.year, current.month - 1, 1);
  return (
    <div className={styles.container}>
      <div className={styles.month}>
        <ul>
          <IconButton
            aria-label="Switch language"
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
          <IconButton
            aria-label="Switch language"
            variant="ghost"
            color="current"
            icon={<FiChevronRight />}
            borderRadius="50%"
            float="right"
            size="lg"
            onClick={handleNextClick}
          />
          <li>
            {currentDate.toLocaleDateString("en", { month: "long" })}
            <br />
            <b>{current.year}</b>
          </li>
        </ul>
      </div>

      <Grid
        templateColumns="repeat(7, 1fr)"
        gridAutoRows="1fr"
        gridRowGap="0.5rem"
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
    </div>
  );
};

export default Calendar;
