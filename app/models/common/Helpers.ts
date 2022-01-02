import { v4 as uuidv4 } from "uuid";

function dateNow() {
  return new Date().toISOString();
}

export class Helpers {
  static id(maybeId?: string) {
    return { id: maybeId ?? uuidv4() };
  }

  static get createdAt() {
    return { created_at_timestamp: dateNow() };
  }

  static get updatedAt() {
    return { updated_at_timestamp: dateNow() };
  }
}
