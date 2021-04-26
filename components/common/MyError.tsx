import { Alert, AlertIcon } from "@chakra-ui/alert";

const MyError = ({ message }: { message: string }) => {
  return (
    <Alert status="error" rounded="lg">
      <AlertIcon />
      {message}
    </Alert>
  );
};

export default MyError;
