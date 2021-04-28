import { Spinner } from "@chakra-ui/spinner";
import { useMyTheme } from "hooks/common";

const MySpinner = () => {
  const { themeColorShade } = useMyTheme();
  return <Spinner color={themeColorShade} thickness="3px" />;
};

export default MySpinner;
