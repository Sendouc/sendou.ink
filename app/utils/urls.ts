export function oldSendouInkUserProfile({ discordId }: { discordId: string }) {
  return `https://sendou.ink/u/${discordId}`;
}

export function oldSendouInkPlayerProfile({
  principalId,
}: {
  principalId: string;
}) {
  return `https://sendou.ink/pid/${principalId}`;
}

export function tournamentManageTeamPage({
  organization,
  tournament,
}: {
  organization: string;
  tournament: string;
}) {
  return `/to/${organization}/${tournament}/manage-team`;
}

export function sendouQFrontPage() {
  return "/play";
}
export function sendouQLookingPage() {
  return "/play/looking";
}
export function sendouQAddPlayersPage() {
  return "/play/add-players";
}
export function sendouQMatchPage(matchId: string) {
  return `/play/match/${matchId}`;
}
export function playerMatchHistoryPage(userId: string) {
  return `/play/history/${userId}`;
}

export function chatRoute(roomIds?: string[]) {
  if (!roomIds || roomIds.length === 0) return "/chat";
  return `/chat?${roomIds.map((id) => `id=${id}`).join("&")}`;
}
