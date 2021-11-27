import type { MetaFunction } from "remix";

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
