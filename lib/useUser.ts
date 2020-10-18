import { User as PrismaUser } from "@prisma/client";
import { useSession } from "next-auth/client";

const useUser = (): [PrismaUser | undefined | null, boolean] => {
  // @ts-ignore
  return useSession();
};

export default useUser;
