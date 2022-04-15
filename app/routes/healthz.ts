import { LoaderFunction } from "@remix-run/node";
import { db } from "~/utils/db.server";

export const loader: LoaderFunction = async () => {
  try {
    const res = await db.$queryRaw`SELECT 1+1 as val;`;
    const val = (res as { val: 2 }[])[0].val;
    if (val !== 2) {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      throw new Error(`val was: ${val}`);
    }
    return new Response(null, { status: 204 });
  } catch (e) {
    console.error((e as Error).message);
    return new Response(null, { status: 500 });
  }
};
