const { withRootDb } = require("./helpers");

describe("checks identifier", () => {
  test("rejects invalid characters", () =>
    withRootDb(async (pgClient) => {
      try {
        await pgClient.query(
          `
         insert into sendou_ink.organization (identifier, owner_id, name, discord_invite_code)
         values ('in-the-zone-å', 1, 'Sendou', '');
        `
        );
        throw new Error("query should not pass");
      } catch (e) {
        expect(e.message).toContain("violates check constraint");
      }
    }));

  test("rejects too short", () =>
    withRootDb(async (pgClient) => {
      try {
        await pgClient.query(
          `
         insert into sendou_ink.organization (identifier, owner_id, name, discord_invite_code)
         values ('i', 1, 'Sendou', '');
        `
        );
        throw new Error("query should not pass");
      } catch (e) {
        expect(e.message).toContain("violates check constraint");
      }
    }));

  test("accepts normal valid", () =>
    withRootDb(async (pgClient) => {
      const {
        rows: [organization],
      } = await pgClient.query(
        `
         insert into sendou_ink.organization (identifier, owner_id, name, discord_invite_code)
         values ('in-the-zone', 1, 'Sendou', '')
         returning *;
        `
      );

      expect(organization.identifier).toBe("in-the-zone");
    }));

  test("accepts long", () =>
    withRootDb(async (pgClient) => {
      const identifier = new Array(50).fill("a").join("");
      const {
        rows: [organization],
      } = await pgClient.query(
        `
         insert into sendou_ink.organization (identifier, owner_id, name, discord_invite_code)
         values ('${identifier}', 1, 'Sendou', '')
         returning *;
        `
      );

      expect(organization.identifier).toBe(identifier);
    }));
});
