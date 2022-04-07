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

export const tournamentFrontPage = ({
  organization,
  tournament,
}: {
  organization: string;
  tournament: string;
}) => `/to/${organization}/${tournament}`;
export function tournamentManageTeamPage({
  organization,
  tournament,
}: {
  organization: string;
  tournament: string;
}) {
  return `/to/${organization}/${tournament}/manage-team`;
}
export function tournamentTeamsPage({
  organization,
  tournament,
}: {
  organization: string;
  tournament: string;
}) {
  return `/to/${organization}/${tournament}/teams`;
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
// TODO: remove string
export function sendouQMatchPage(matchId: string | number) {
  return `/play/match/${matchId}`;
}
export function playerMatchHistoryPage(userId: string) {
  return `/play/history/${userId}`;
}

export function chatRoute(roomIds?: string[]) {
  if (!roomIds || roomIds.length === 0) return "/chat";
  return `/chat?${roomIds.map((id) => `id=${id}`).join("&")}`;
}
