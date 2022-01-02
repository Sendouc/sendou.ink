import { Database } from "../../utils/db.server";
import fs from "node:fs";
import path from "node:path";

export class Model {
  // TODO: private..?
  prepareSql(db: Database["db"], ...pathSegments: string[]) {
    const sql = fs.readFileSync(path.resolve(...pathSegments), "utf8");
    return db.prepare(sql);
  }
}
