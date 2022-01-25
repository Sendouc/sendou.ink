import { ActionFunction, Form, LinksFunction, MetaFunction } from "remix";
import { LFGGroupSelector } from "~/components/play/LFGGroupSelector";
import styles from "~/styles/play.css";
import { makeTitle } from "~/utils";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export const action: ActionFunction = async ({ request }) => {
  const data = Object.entries(await request.formData());
  console.log(data);

  return null;
};

export const meta: MetaFunction = () => {
  return {
    title: makeTitle("Play!"),
  };
};

// TODO: loader: redirect to /lfg if active LFGGroup
//               redirect to /match if active LFGGroup AND match

export default function PlayPage() {
  return (
    <div className="container">
      <Form method="post">
        <LFGGroupSelector />
        <button type="submit">Submit</button>
      </Form>
    </div>
  );
}
