import { Heading } from "@chakra-ui/core";
import { useMyTheme } from "lib/useMyTheme";

interface PageHeaderProps {
  title: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title }) => {
  const { themeColor } = useMyTheme();
  return (
    <>
      <Heading
        className="shadow"
        borderBottomColor={themeColor}
        borderBottomWidth="5px"
        mb="0.5em"
        fontFamily="'Rubik', sans-serif"
        fontWeight="bold"
      >
        {title}
      </Heading>
    </>
  );
};

export default PageHeader;
