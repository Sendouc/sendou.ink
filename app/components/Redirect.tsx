import { useNavigate } from "@remix-run/react";
import type { To } from "history";
import * as React from "react";

export function Redirect({ to }: { to: To }) {
  const navigate = useNavigate();

  React.useEffect(() => {
    navigate(to);
  }, [navigate, to]);

  return null;
}
