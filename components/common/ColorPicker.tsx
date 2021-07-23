import { Box } from "@chakra-ui/layout";
import {
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
} from "@chakra-ui/popover";
import { CSSVariables } from "utils/CSSVariables";
import { CirclePicker } from "react-color";

interface Props {
  color: string;
  setColor: (color: string) => void;
}

const ColorPicker: React.FC<Props> = ({ color, setColor }) => {
  return (
    <>
      <Popover>
        <PopoverTrigger>
          <Box w="25px" h="25px" borderRadius="50%" bg={color} />
        </PopoverTrigger>
        <PopoverContent width="16.5rem">
          <PopoverArrow bg={CSSVariables.secondaryBgColor} />
          <PopoverBody bg={CSSVariables.secondaryBgColor} rounded="lg">
            <CirclePicker
              width="16.5rem"
              color={color}
              onChange={({ hex }) => setColor(hex)}
            />
          </PopoverBody>
        </PopoverContent>
      </Popover>
    </>
  );
};

export default ColorPicker;
