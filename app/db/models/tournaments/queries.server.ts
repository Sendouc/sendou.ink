export function findByIdentifier(identifier: string) {
  return {
    name: "In The Zone X",
    description:
      "In The Zone X is a tournament hosted by the In The Zone community.",
    authorId: 1,
    startTime: 1669409425,
    // one hour less than startTime
    checkInStartTime: 1669405825,
    styles: {
      bannerBackground:
        "radial-gradient(circle, rgba(238,174,202,1) 0%, rgba(148,187,233,1) 100%)",
      text: `hsl(231, 9%, 16%)`,
      textTransparent: `hsla(231, 9%, 16%, 0.3)`,
    },
    brackets: [
      {
        id: 1,
        rounds: [],
      },
    ],
    teams: [
      { id: 1, members: [{ id: 1, isOwner: true }], checkedInTime: 1669405826 },
    ],
    ownTeam: {
      id: 1,
      members: [{ id: 1, isOwner: true }],
      checkedInTime: 1669405826,
    },
  };
}
