/* eslint-disable no-console */
import "dotenv/config";
import { seed } from "~/db/seed";

console.log("seeding...");
seed();
console.log("done!");
