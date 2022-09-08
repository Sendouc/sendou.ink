import { Main } from "~/components/Main";

export default function BuildAnalyzerPage() {
  if (process.env.NODE_ENV === "production") return <Main>Coming soon :)</Main>;

  return <Main>hellou</Main>;
}
