import { Button } from "@chakra-ui/button";

export function PlusVotingButton({
  number,
  onClick,
  disabled,
}: {
  number: number;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <Button
      borderRadius="50%"
      height={12}
      width={12}
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
