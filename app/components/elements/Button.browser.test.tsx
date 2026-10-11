import { describe, expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";
import { SendouButton } from "./Button";

describe("SendouButton", () => {
	test("keeps its accessible name and focus while pending", async () => {
		const screen = await render(<SendouButton isPending>Save</SendouButton>);

		const button = screen.getByRole("button", { name: "Save" });
		await expect.element(button).toHaveAttribute("aria-busy", "true");

		button.element().focus();
		expect(document.activeElement).toBe(button.element());
	});

	test("ignores clicks while pending", async () => {
		const onClick = vi.fn();
		const screen = await render(
			<SendouButton isPending onClick={onClick}>
				Save
			</SendouButton>,
		);

		await screen.getByRole("button").click({ force: true });

		expect(onClick).not.toHaveBeenCalled();
	});
});
