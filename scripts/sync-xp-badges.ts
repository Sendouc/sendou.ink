/* eslint-disable no-console */
import "dotenv/config";
import { syncXPBadges } from "~/features/badges/queries/syncXPBadges.server";

syncXPBadges();

console.log("Synced XP badges");
