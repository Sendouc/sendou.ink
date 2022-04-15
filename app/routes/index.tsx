import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return {
    title: "sendou.ink",
  };
};

export default function Index() {
  return (
    <div>
      <main>
        <h2>Welcome to sendou.ink!</h2>
      </main>
    </div>
  );
}
