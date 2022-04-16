import { useLocation } from "@remix-run/react";
import { getLogInUrl } from "~/utils";
import { Button } from "./Button";

export function PleaseLogin({
  texts,
}: {
  texts: [beforeButton: string, buttonText: string, afterButton: string];
}) {
  const location = useLocation();

  return (
    <form action={getLogInUrl(location)} method="post">
      <p className="button-text-paragraph">
        {texts[0]}{" "}
        <Button type="submit" variant="minimal">
          {texts[1]}
        </Button>{" "}
        {texts[2]}
      </p>
    </form>
  );
}
