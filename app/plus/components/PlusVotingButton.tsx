import { Button } from "@chakra-ui/button";

export function PlusVotingButton({
  number,
  onClick,
}: {
  number: -2 | -1 | 1 | 2;
  onClick: () => void;
}) {
  return (
    <Button
      borderRadius="50%"
      height={12}
      width={12}
      variant="outline"
      colorScheme={number < 0 ? "red" : "theme"}
      onClick={onClick}
    >
      {number > 0 ? "+" : ""}
      {number}
    </Button>
  );
}
