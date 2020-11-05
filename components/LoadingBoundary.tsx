import { ApolloError } from "@apollo/client";
import { Alert, AlertDescription, AlertIcon, Spinner } from "@chakra-ui/core";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

interface Props {
  children: React.ReactNode;
  loading?: boolean;
  error?: ApolloError;
}

const LoadingBoundary: React.FC<Props> = ({ children, loading, error }) => {
  const [showSpinner, setShowSpinner] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => setShowSpinner(true), 1000);

    return () => clearTimeout(timer);
  }, []);

  if (loading || router.isFallback) {
    return showSpinner ? <Spinner size="xl" /> : null;
  }

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }

  return <>{children}</>;
};

export default LoadingBoundary;
