import usePlusVoting from "../hooks/usePlusVoting";

export default function PlusVotingPage() {
  const { isLoading, usersToVoteOn } = usePlusVoting();

  if (isLoading) return null;
  return (
    <h1>
      <pre>{JSON.stringify(usersToVoteOn, null, 2)}</pre>
    </h1>
  );
}
