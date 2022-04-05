import postgres from "postgres";

const sql = postgres({
  transform: {
    column: {
      from: postgres.toCamel,
      to: postgres.fromCamel,
    },
  },
});

export default sql;
