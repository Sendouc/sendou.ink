import { type LoaderFunction, redirect } from "@remix-run/node";

export { action } from "~/modules/theme";

export const loader: LoaderFunction = () => redirect("/", { status: 404 });
