import { Box, BoxProps, Flex } from "@chakra-ui/react";
import { useState } from "react";
import SubText from "./SubText";

interface Props {
  title: string;
  children: React.ReactNode;
  isOpenByDefault?: boolean;
}

const SubTextCollapse: React.FC<Props & BoxProps> = ({
  title,
  children,
  isOpenByDefault = false,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(isOpenByDefault);
  return (
    <>
      <SubText onClick={() => setIsOpen(!isOpen)} {...props} cursor="pointer">
        <Flex userSelect="none">
          <Box w={4} transform="rotate(0deg)">
            {isOpen ? "▼" : "►"}
          </Box>{" "}
          {title}
        </Flex>
      </SubText>
      {isOpen && <>{children}</>}
    </>
  );
};

export default SubTextCollapse;
