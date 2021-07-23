import { Spinner } from "@chakra-ui/spinner";
import { CSSVariables } from "utils/CSSVariables";

const MySpinner = () => {
  return <Spinner color={CSSVariables.themeColor} thickness="3px" />;
};

export default MySpinner;
