import clone from "just-clone";
import type {
  CrudInterface,
  OmitId,
  Table,
  Database,
} from "~/modules/brackets-manager";

export class InMemoryDatabase implements CrudInterface {
  protected data: Database = {
    participant: [],
    stage: [],
    group: [],
    round: [],
    match: [],
    match_game: [],
  };

  /**
   * @param data "import" data from external
   */
  setData(data: Database): void {
    this.data = data;
  }

  /**
   * @param partial Filter
   */
  makeFilter(partial: any): (entry: any) => boolean {
    return (entry: any): boolean => {
      let result = true;
      for (const key of Object.keys(partial))
        result = result && entry[key] === partial[key];

      return result;
    };
  }

  /**
   * Clearing all of the data
   */
  reset(): void {
    this.data = {
      participant: [],
      stage: [],
      group: [],
      round: [],
      match: [],
      match_game: [],
    };
  }

  insert<T>(table: Table, value: OmitId<T>): number;
  /**
   * Inserts multiple values in the database.
   *
   * @param table Where to insert.
   * @param values What to insert.
   */
  insert<T>(table: Table, values: OmitId<T>[]): boolean;

  /**
   * Implementation of insert
   *
   * @param table Where to insert.
   * @param values What to insert.
   */
  insert<T>(table: Table, values: OmitId<T> | OmitId<T>[]): number | boolean {
    let id =
      this.data[table].length > 0
        ? Math.max(...this.data[table].map((d) => d.id)) + 1
        : 0;

    if (!Array.isArray(values)) {
      try {
        // @ts-expect-error imported
        this.data[table].push({ id, ...values });
      } catch (error) {
        return -1;
      }
      return id;
    }

    try {
      values.forEach((object) => {
        // @ts-expect-error imported
        this.data[table].push({ id: id++, ...object });
      });
    } catch (error) {
      return false;
    }

    return true;
  }

  /**
   * Gets all data from a table in the database.
   *
   * @param table Where to get from.
   */
  select<T>(table: Table): T[] | null;
  /**
   * Gets specific data from a table in the database.
   *
   * @param table Where to get from.
   * @param id What to get.
   */
  select<T>(table: Table, id: number): T | null;
  /**
   * Gets data from a table in the database with a filter.
   *
   * @param table Where to get from.
   * @param filter An object to filter data.
   */
  select<T>(table: Table, filter: Partial<T>): T[] | null;

  /**
   * @param table Where to get from.
   * @param arg Arg.
   */
  select<T>(table: Table, arg?: number | Partial<T>): T[] | null {
    try {
      if (arg === undefined) {
        // @ts-expect-error imported
        return this.data[table].map(clone);
      }

      if (typeof arg === "number") {
        // @ts-expect-error imported
        return clone(this.data[table].find((d) => d.id === arg));
      }

      // @ts-expect-error imported
      return this.data[table].filter(this.makeFilter(arg)).map(clone);
    } catch (error) {
      return null;
    }
  }

  /**
   * Updates data in a table.
   *
   * @param table Where to update.
   * @param id What to update.
   * @param value How to update.
   */

  update<T>(table: Table, id: number, value: T): boolean;

  /**
   * Updates data in a table.
   *
   * @param table Where to update.
   * @param filter An object to filter data.
   * @param value How to update.
   */
  update<T>(table: Table, filter: Partial<T>, value: Partial<T>): boolean;

  /**
   * Updates data in a table.
   *
   * @param table Where to update.
   * @param arg
   * @param value How to update.
   */
  update<T>(
    table: Table,
    arg: number | Partial<T>,
    value?: Partial<T>
  ): boolean {
    if (typeof arg === "number") {
      try {
        // @ts-expect-error imported
        this.data[table][arg] = value;
        return true;
      } catch (error) {
        return false;
      }
    }

    // @ts-expect-error imported
    const values = this.data[table].filter(this.makeFilter(arg));
    if (!values) {
      return false;
    }

    values.forEach((v: { id: any }) => {
      const existing = this.data[table][v.id];
      for (const key in value) {
        if (
          // @ts-expect-error imported
          existing[key] &&
          // @ts-expect-error imported
          typeof existing[key] === "object" &&
          typeof value[key] === "object"
        ) {
          // @ts-expect-error imported
          Object.assign(existing[key], value[key]); // For opponent objects, this does a deep merge of level 2.
        } else {
          // @ts-expect-error imported
          existing[key] = value[key]; // Otherwise, do a simple value assignment.
        }
      }
      this.data[table][v.id] = existing;
    });

    return true;
  }

  /**
   * Empties a table completely.
   *
   * @param table Where to delete everything.
   */
  delete(table: Table): boolean;
  /**
   * Delete data in a table, based on a filter.
   *
   * @param table Where to delete in.
   * @param filter An object to filter data.
   */
  delete<T>(table: Table, filter: Partial<T>): boolean;

  /**
   * Delete data in a table, based on a filter.
   *
   * @param table Where to delete in.
   * @param filter An object to filter data.
   */
  delete<T>(table: Table, filter?: Partial<T>): boolean {
    const values = this.data[table];
    if (!values) {
      return false;
    }

    if (!filter) {
      this.data[table] = [];

      return true;
    }

    const predicate = this.makeFilter(filter);
    const negativeFilter = (value: any): boolean => !predicate(value);

    // @ts-expect-error imported
    this.data[table] = values.filter(negativeFilter);

    return true;
  }
}
