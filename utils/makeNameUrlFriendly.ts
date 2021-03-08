export function makeNameUrlFriendly(name: string) {
  return name.trim().replace(/\s\s+/g, " ").toLowerCase().replace(/ /g, "-");
}
