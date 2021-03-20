import { Button } from "@chakra-ui/button";

export function PlusVotingButton({
  number,
  onClick,
  disabled,
  isSmall,
}: {
  number: number;
  onClick: () => void;
  disabled?: boolean;
  isSmall?: boolean;
}) {
  return (
    <Button
      borderRadius="50%"
      height={isSmall ? 10 : 12}
      width={isSmall ? 10 : 12}
      variant="outline"
      colorScheme={number < 0 ? "red" : "theme"}
      onClick={onClick}
      disabled={disabled}
    >
      {number > 0 ? "+" : ""}
      {number}
    </Button>
  );
}
