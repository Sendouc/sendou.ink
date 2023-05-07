import * as React from "react";

/** Forces the component to rerender every second */
export function useAutoRerender() {
  const [, setNow] = React.useState(new Date().getTime());

  React.useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date().getTime());
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);
}
