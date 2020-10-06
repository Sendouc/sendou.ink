import {
  Alert as ChakraAlert,
  AlertIcon,
  AlertProps as ChakraAlertProps,
  CloseButton,
} from "@chakra-ui/core";
import React from "react";

interface AlertProps {
  children: React.ReactNode;
  status: "error" | "success" | "warning" | "info";
  mt?: string;
  onClose?: () => void;
}

const Alert: React.FC<AlertProps & ChakraAlertProps> = ({
  children,
  status,
  onClose,
  mt = "2em",
  ...props
}) => {
  return (
    <ChakraAlert status={status} borderRadius="5px" mt={mt} {...props}>
      <AlertIcon />
      {children}
      {onClose && (
        <CloseButton
          onClick={onClose}
          position="absolute"
          right="8px"
          top="8px"
        />
      )}
    </ChakraAlert>
  );
};

export default Alert;
