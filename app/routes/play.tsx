import { type LoaderFunction, redirect } from "@remix-run/node";
import { SENDOUQ_PAGE } from "~/utils/urls";

export const loader: LoaderFunction = () => {
  throw redirect(SENDOUQ_PAGE);
};
