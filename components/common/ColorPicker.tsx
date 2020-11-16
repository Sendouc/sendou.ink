import { Box } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";

interface Props {
  color: string;
  setColor: (color: string) => void;
}

const ColorPicker: React.FC<Props> = ({ color, setColor }) => {
  const [colorInternal, setColorInternal] = useState(color);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setColor(colorInternal), 250);

    return () => clearTimeout(timer);
  }, [colorInternal]);

  return (
    <>
      <input
        ref={ref}
        type="color"
        style={{ visibility: "hidden", height: "50px", width: 0 }}
        value={color}
        onChange={(e) => setColorInternal(e.target.value)}
      />
      <Box
        w="25px"
        h="25px"
        borderRadius="50%"
        bg={color}
        onClick={() => ref.current?.click()}
      />
    </>
  );
};

export default ColorPicker;
