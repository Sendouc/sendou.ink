import { Input } from "@chakra-ui/input";
import { Flex } from "@chakra-ui/layout";

export default function DatePicker({
  date,
  onChange,
}: {
  date: Date;
  onChange: (date: Date) => void;
}) {
  const dateString = `${date.getFullYear()}-${
    date.getMonth() < 10 ? "0" : ""
  }${date.getMonth()}-${date.getDate() < 10 ? "0" : ""}${date.getDate()}`;

  const timeString = `${
    date.getHours() < 10 ? "0" : ""
  }${date.getHours()}:${date.getMinutes()}`;

  console.log({ dateString });
  console.log({ timeString });
  return (
    <Flex>
      <Input
        value={dateString}
        onChange={(e) => onChange(new Date(`${e.target.value} ${timeString}`))}
        type="date"
        mr={2}
      />
      <Input
        value={timeString}
        onChange={(e) => onChange(new Date(`${dateString} ${e.target.value}`))}
        type="time"
        ml={2}
      />
    </Flex>
  );
}
