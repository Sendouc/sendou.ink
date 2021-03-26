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
  }${date.getMonth()}-${date.getDate()}`;
  const timeString = `${date.getHours()}:${date.getMinutes()}`;
  return (
    <Flex>
      <Input
        value={dateString}
        onChange={(e: any) =>
          onChange(new Date(`${e.target.value} ${timeString}`))
        }
        type="date"
        mr={2}
      />
      <Input
        value={timeString}
        onChange={(e: any) =>
          onChange(new Date(`${dateString} ${e.target.value}`))
        }
        type="time"
        ml={2}
      />
    </Flex>
  );
}
