import { Button, IconButton } from "@chakra-ui/button";
import { Flex } from "@chakra-ui/layout";
import { useState } from "react";
import { FiEdit } from "react-icons/fi";
import { PlusVotingButton } from "./PlusVotingButton";

export function ChangeVoteButtons({
  score,
  isSameRegion,
  editVote,
}: {
  score: number;
  isSameRegion: boolean;
  editVote: (score: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [currentScore, setCurrentScore] = useState(score);

  const getNextScore = () => {
    if (!isSameRegion) {
      if (currentScore === 1) return -1;
      return 1;
    }

    if (currentScore === -2) return -1;
    if (currentScore === -1) return 1;
    if (currentScore === 1) return 2;

    return -2;
  };

  return (
    <>
      <Flex align="center">
        <PlusVotingButton
          number={currentScore}
          onClick={() => setCurrentScore(getNextScore())}
          disabled={!editing}
          isSmall
        />
      </Flex>
      {editing ? (
        <Button
          size="sm"
          mr={2}
          my="auto"
          onClick={() => {
            editVote(currentScore);
            setEditing(false);
          }}
        >
          Save
        </Button>
      ) : (
        <IconButton
          aria-label="Edit vote"
          icon={<FiEdit />}
          colorScheme="gray"
          variant="ghost"
          onClick={() => setEditing(!editing)}
          my="auto"
        />
      )}
      {editing ? (
        <Button
          colorScheme="red"
          onClick={() => {
            setEditing(false);
            setCurrentScore(score);
          }}
          size="sm"
          ml={2}
          my="auto"
        >
          Cancel
        </Button>
      ) : (
        <div />
      )}
    </>
  );
}
