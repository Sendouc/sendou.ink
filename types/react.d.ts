/* eslint-disable @typescript-eslint/no-unused-vars */
import type * as React from "react";

declare module "react" {
  interface CSSProperties {
    [key: `--${string}`]: string | number | undefined;
  }
}
