import { useNavigate } from "@remix-run/react";
import * as React from "react";

export function Navigate({ to }: { to: string }) {
  const navigate = useNavigate();
  React.useEffect(() => {
    navigate(to);
  }, [navigate, to]);

  return null;
}
