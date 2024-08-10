import { mock } from "bun:test";

mock.module("newrelic", () => {
	return {
		default: null,
	};
});
