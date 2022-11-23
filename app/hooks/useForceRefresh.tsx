import * as React from "react";

export function useForceRefreshOnMount() {
  const [, setOne] = React.useState(0);

  React.useEffect(() => {
    setOne(1);
  }, []);
}
