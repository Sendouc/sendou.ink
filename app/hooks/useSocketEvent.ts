import * as React from "react";
import { useSocket } from "~/utils/socketContext";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useSocketEvent(event: string, handler: (data: any) => void) {
  const socket = useSocket();

  React.useEffect(() => {
    if (!socket) return;
    socket.on(event, handler);

    return () => {
      socket.off(event);
    };
  }, [socket, handler]);
}
