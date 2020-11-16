import { CircularProgress, CircularProgressProps } from "@chakra-ui/react";

interface Props {
  currentLength: number;
  maxLength: number;
}

const getColor = (value: number) => {
  if (value >= 100) return "red.500";

  if (value >= 75) return "yellow.500";

  return "theme.500";
};

const LimitProgress: React.FC<Props & CircularProgressProps> = ({
  currentLength,
  maxLength,
  ...props
}) => {
  const value = Math.floor((currentLength / maxLength) * 100);
  return (
    <CircularProgress
      size="20px"
      value={value}
      thickness="16px"
      color={getColor(value)}
      {...props}
    />
  );
};

export default LimitProgress;
