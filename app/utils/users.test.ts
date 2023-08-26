import { suite } from "uvu";
import * as assert from "uvu/assert";
import { queryToUserIdentifier } from "./users";

const QueryToUserIdentifier = suite("queryToUserIdentifier()");

QueryToUserIdentifier("returns null if no match", () => {
  assert.equal(queryToUserIdentifier("foo"), null);
});

QueryToUserIdentifier("gets custom url from url", () => {
  assert.equal(queryToUserIdentifier("https://sendou.ink/u/sendou"), {
    customUrl: "sendou",
  });
});

QueryToUserIdentifier("gets discord id from url", () => {
  assert.equal(
    queryToUserIdentifier("https://sendou.ink/u/79237403620945920"),
    {
      discordId: "79237403620945920",
    }
  );
});

QueryToUserIdentifier("gets custom url from url (without https://)", () => {
  assert.equal(queryToUserIdentifier("sendou.ink/u/sendou"), {
    customUrl: "sendou",
  });
});

QueryToUserIdentifier("gets discord id", () => {
  assert.equal(queryToUserIdentifier("79237403620945920"), {
    discordId: "79237403620945920",
  });
});

QueryToUserIdentifier("gets id", () => {
  assert.equal(queryToUserIdentifier("1"), {
    id: 1,
  });
});

QueryToUserIdentifier.run();
