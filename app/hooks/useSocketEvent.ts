import io from "socket.io-client";
import * as React from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useSocketEvent(event: string, handler: (data: any) => void) {
  React.useEffect(() => {
    const socket = io();

    socket.on(event, handler);

    return () => {
      socket.close();
    };
  }, []);
}
