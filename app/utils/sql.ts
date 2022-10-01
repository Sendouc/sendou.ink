export function errorIsSqliteUniqueConstraintFailure(error: any) {
  return error?.code === "SQLITE_CONSTRAINT_UNIQUE";
}
