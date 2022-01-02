import { PrismaClient } from "@prisma/client";
import SQLite3 from "better-sqlite3";
import { UserModel } from "~/models/User/User";
// import { v4 as uuidv4 } from "uuid";

let db: PrismaClient;

declare global {
  var __db: PrismaClient | undefined;
}

// this is needed because in development we don't want to restart
// the server with every change, but we want to make sure we don't
// create a new connection to the DB with every change either.
if (process.env.NODE_ENV === "production") {
  db = new PrismaClient();
  db.$connect();
} else {
  if (!global.__db) {
    global.__db = new PrismaClient();
    global.__db.$connect();
  }
  db = global.__db;
}

export { db };

export class Database {
  db;
  user;
  //static #instance: Database;
  constructor() {
    // make Database class into singleton
    // if (Database.#instance) {
    //   return Database.#instance;
    // }
    // Database.#instance = this;

    this.db = new SQLite3("db.sqlite3");
    this.user = new UserModel(this.db);
  }
  // init() {
  //   for (const model of this.registered_models) model.init()
  // }

  // // model  definitions
  // book = this.register(BookModel)
}
