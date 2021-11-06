require("dotenv").config();
const { Pool } = require("pg");

const TEST_DATABASE_URL = process.env.DATABASE_URL;

if (!TEST_DATABASE_URL) {
  throw new Error("Cannot run tests without a TEST_DATABASE_URL");
}

const pools = {};

// Make sure we release those pgPools so that our tests exit!
afterAll(() => {
  const keys = Object.keys(pools);
  return Promise.all(
    keys.map(async (key) => {
      try {
        const pool = pools[key];
        delete pools[key];
        pool.end();
      } catch (e) {
        console.error("Failed to release connection!");
        console.error(e);
      }
    })
  );
});

const poolFromUrl = (url) => {
  if (!pools[url]) {
    pools[url] = new Pool({ connectionString: url });
  }
  return pools[url];
};

const withDbFromUrl = async (url, fn) => {
  /** @type {import ("pg").Pool} */
  const pool = poolFromUrl(url);
  const client = await pool.connect();
  await client.query("BEGIN ISOLATION LEVEL SERIALIZABLE;");

  console.log("3");
  try {
    await fn(client);
  } catch (e) {
    console.log("hmm");
    // Error logging can be helpful:
    if (typeof e.code === "string" && e.code.match(/^[0-9A-Z]{5}$/)) {
      console.error([e.message, e.code, e.detail, e.hint, e.where].join("\n"));
    }
    throw e;
  } finally {
    await client.query("ROLLBACK;");
    await client.query("RESET ALL;"); // Shouldn't be necessary, but just in case...
    client.release();
  }
};

const withRootDb = (fn) => withDbFromUrl(TEST_DATABASE_URL, fn);

// const becomeRoot = (client) => client.query("reset role");

/******************************************************************************
 **                                                                          **
 **     BELOW HERE, YOU'LL WANT TO CUSTOMISE FOR YOUR OWN DATABASE SCHEMA    **
 **                                                                          **
 ******************************************************************************/

// export const becomeUser = async (
//   client: PoolClient,
//   userOrUserId: User | string | null
// ) => {
//   await becomeRoot(client);
//   const session = userOrUserId
//     ? await createSession(
//         client,
//         typeof userOrUserId === "object" ? userOrUserId.id : userOrUserId
//       )
//     : null;
//   await client.query(
//     `select set_config('role', $1::text, true),
//             set_config('jwt.claims.session_id', $2::text, true)`,
//     [process.env.DATABASE_VISITOR, session ? session.uuid : ""]
//   );
// };

// // Enables multiple calls to `createUsers` within the same test to still have
// // deterministic results without conflicts.
// let userCreationCounter = 0;
// beforeEach(() => {
//   userCreationCounter = 0;
// });

// export const createUsers = async function createUsers(
//   client: PoolClient,
//   count: number = 1,
//   verified: boolean = true
// ) {
//   const users = [];
//   if (userCreationCounter > 25) {
//     throw new Error("Too many users created!");
//   }
//   for (let i = 0; i < count; i++) {
//     const userLetter = "abcdefghijklmnopqrstuvwxyz"[userCreationCounter];
//     userCreationCounter++;
//     const password = userLetter.repeat(12);
//     const email = `${userLetter}${i || ""}@b.c`;
//     const user: User = (
//       await client.query(
//         `SELECT * FROM app_private.really_create_user(
//           username := $1,
//           email := $2,
//           email_is_verified := $3,
//           name := $4,
//           avatar_url := $5,
//           password := $6
//         )`,
//         [
//           `testuser_${userLetter}`,
//           email,
//           verified,
//           `User ${userLetter}`,
//           null,
//           password,
//         ]
//       )
//     ).rows[0];
//     expect(user.id).not.toBeNull();
//     user._email = email;
//     user._password = password;
//     users.push(user);
//   }
//   return users;
// };

module.exports = {
  withRootDb,
};
