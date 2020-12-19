import { GetAllSalmonRunRecordsData } from "prisma/queries/getAllSalmonRunRecords";
import useSWR from "swr";

export function useSalmonRunRecords() {
  const { data = [] } = useSWR<GetAllSalmonRunRecordsData>("/api/sr/records");

  return {
    data: data.filter((record) => record.approved),
    pendingCount: data.reduce(
      (acc, record) => (!record.approved ? ++acc : acc),
      0
    ),
  };
}
