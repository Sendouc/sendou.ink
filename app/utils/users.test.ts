import MockDate from "mockdate";
import { suite } from "uvu";
import * as assert from "uvu/assert";
import { queryToUserIdentifier, userDiscordIdIsAged } from "./users";

const QueryToUserIdentifier = suite("queryToUserIdentifier()");
const UserDiscordIdIsAged = suite("userDiscordIdIsAged()");

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
		},
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

UserDiscordIdIsAged.before.each(() => {
	MockDate.set(new Date("2023-11-25T00:00:00.000Z"));
});

UserDiscordIdIsAged.after.each(() => {
	MockDate.reset();
});

UserDiscordIdIsAged("returns false if discord id is not aged", () => {
	assert.equal(
		userDiscordIdIsAged({ discordId: "1177730652641181871" }),
		false,
	);
});

UserDiscordIdIsAged("returns true if discord id is aged", () => {
	assert.equal(userDiscordIdIsAged({ discordId: "79237403620945920" }), true);
});

UserDiscordIdIsAged("throws error if discord id missing", () => {
	assert.throws(() => userDiscordIdIsAged({ discordId: "" }));
});

UserDiscordIdIsAged("throws error if discord id too short", () => {
	assert.throws(() => userDiscordIdIsAged({ discordId: "1234" }));
});

QueryToUserIdentifier.run();
UserDiscordIdIsAged.run();
