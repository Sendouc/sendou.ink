import { suite } from "uvu";
import * as assert from "uvu/assert";
import { pathnameFromPotentialURL } from "./strings";

const PathnameFromPotentialURL = suite("pathnameFromPotentialURL()");

PathnameFromPotentialURL("Resolves path name from valid URL", () => {
	assert.is(pathnameFromPotentialURL("https://twitter.com/sendouc"), "sendouc");
});

PathnameFromPotentialURL("Returns string as is if not URL", () => {
	assert.is(pathnameFromPotentialURL("sendouc"), "sendouc");
});

PathnameFromPotentialURL.run();
