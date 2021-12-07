export const checkInHasStarted = (checkInStartTime: string) =>
  new Date(checkInStartTime) < new Date();
