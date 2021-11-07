const { withRootDb } = require("./helpers");

describe("checks hsl args", () => {
  test("rejects invalid hsl arg", () =>
    withRootDb(async (pgClient) => {
      try {
        await pgClient.query(
          `
          insert into sendou_ink.tournament (banner_text_hsl_args, identifier, name, description, start_time, banner_background, organization_identifier)
          values ('31 9% 16%;', 'in-the-zone-xi', 'In The Zone X', 'In The Zone eXtremeeeee', '2022-06-22 20:00:00', 'linear-gradient(to bottom, #9796f0, #fbc7d4)', 'sendous');
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
        rows: [tournament],
      } = await pgClient.query(
        `
        insert into sendou_ink.tournament (banner_text_hsl_args, identifier, name, description, start_time, banner_background, organization_identifier)
        values ('31 9% 16%', 'in-the-zone-xi', 'In The Zone X', 'In The Zone eXtremeeeee', '2022-06-22 20:00:00', 'linear-gradient(to bottom, #9796f0, #fbc7d4)', 'sendous')
        returning *;
        `
      );

      expect(tournament.banner_text_hsl_args).toBe("31 9% 16%");
    }));
});

describe("checks dates", () => {
  test("rejects start time in the past", () =>
    withRootDb(async (pgClient) => {
      try {
        await pgClient.query(
          `
          insert into sendou_ink.tournament (start_time, check_in_time, banner_text_hsl_args, identifier, name, description, banner_background, organization_identifier)
          values ('2020-06-22 20:00:00', '2020-06-22 19:00:00', '31 9% 16%', 'in-the-zone-xi', 'In The Zone X', 'In The Zone eXtremeeeee', 'linear-gradient(to bottom, #9796f0, #fbc7d4)', 'sendous')
          returning *;
          `
        );
        throw new Error("query should not pass");
      } catch (e) {
        expect(e.message).toContain("violates check constraint");
      }
    }));

  test("rejects check-in time after start time", () =>
    withRootDb(async (pgClient) => {
      try {
        await pgClient.query(
          `
          insert into sendou_ink.tournament (start_time, check_in_time, banner_text_hsl_args, identifier, name, description, banner_background, organization_identifier)
          values ('2022-06-22 20:00:00', '2022-06-22 21:00:00', '31 9% 16%', 'in-the-zone-xi', 'In The Zone X', 'In The Zone eXtremeeeee', 'linear-gradient(to bottom, #9796f0, #fbc7d4)', 'sendous')
          returning *;
          `
        );
        throw new Error("query should not pass");
      } catch (e) {
        expect(e.message).toContain("violates check constraint");
      }
    }));
});
