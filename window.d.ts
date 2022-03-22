import { EnvironmentVariable } from "~/root";

declare global {
  interface Window {
    ENV: EnvironmentVariable;
  }
}
