import {
  type LoaderFunction,
  type ActionFunction,
  redirect,
  json,
} from "@remix-run/node";
import { getThemeSession } from "../core/session.server";
import { isTheme } from "../core/provider";

export const action: ActionFunction = async ({ request }) => {
  const themeSession = await getThemeSession(request);
  const requestText = await request.text();
  const form = new URLSearchParams(requestText);
  const theme = form.get("theme");

  if (theme === "auto") {
    return json(
      { success: true },
      { headers: { "Set-Cookie": await themeSession.destroy() } },
    );
  }

  if (!isTheme(theme)) {
    return json({
      success: false,
      message: `theme value of ${theme ?? "null"} is not a valid theme`,
    });
  }

  themeSession.setTheme(theme);
  return json(
    { success: true },
    { headers: { "Set-Cookie": await themeSession.commit() } },
  );
};

export const loader: LoaderFunction = () => redirect("/", { status: 404 });
