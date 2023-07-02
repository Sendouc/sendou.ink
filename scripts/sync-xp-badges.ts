/* eslint-disable no-console */
import "dotenv/config";
import { syncXPBadges } from "~/features/badges";

syncXPBadges();

console.log("Synced XP badges");
