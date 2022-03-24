import { EnvironmentVariables } from "~/root";

declare global {
  interface Window {
    ENV: EnvironmentVariables;
  }
}
