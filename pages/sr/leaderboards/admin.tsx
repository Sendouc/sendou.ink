import { Box, Button } from "@chakra-ui/react";
import MyLink from "components/common/MyLink";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "components/common/Table";
import WeaponImage from "components/common/WeaponImage";
import { useUser } from "hooks/common";
import { useRouter } from "next/router";
import { GetAllSalmonRunRecordsData } from "prisma/queries/getAllSalmonRunRecords";
import { useState } from "react";
import useSWR from "swr";
import { SALMON_RUN_ADMIN_DISCORD_IDS } from "utils/constants";
import { sendData } from "utils/postData";
import { salmonRunCategoryToNatural } from "./new";

const SalmonRunAdminPage = ({}) => {
  const router = useRouter();
  const [user, loading] = useUser();
  const [sending, setSending] = useState(false);
  const [recordsHidden, setRecordsHidden] = useState(new Set<number>());
  const { data } = useSWR<GetAllSalmonRunRecordsData>(
    "/api/sr/records?unapproved=true"
  );

  if (
    !loading &&
    (!user || !SALMON_RUN_ADMIN_DISCORD_IDS.includes(user.discordId))
  ) {
    router.push("/sr/leaderboards");
  }

  if (loading || !data) return null;

  const handleClick = async (type: "DELETE" | "PATCH", id: number) => {
    if (!user) {
      console.error("Unexpected no logged in user");
      return;
    }
    setSending(true);

    const success = await sendData(type, `/api/sr/records/${id}`);
    setSending(false);
    if (!success) return;

    mutate("/api/sr/records");
    setRecordsHidden(new Set(Array.from(recordsHidden).concat(id)));
  };

  const records = data.filter((record) => !recordsHidden.has(record.id));

  return (
    <>
      {records.length === 0 ? (
        <>No results waiting for approval.</>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>Created</TableHeader>
              <TableHeader>Users</TableHeader>
              <TableHeader>Links</TableHeader>
              <TableHeader>Rotation</TableHeader>
              <TableHeader />
              <TableHeader />
            </TableRow>
          </TableHead>
          <TableBody>
            {records.map((record) => {
              return (
                <TableRow key={record.id}>
                  <TableCell>{record.createdAt.toLocaleString()}</TableCell>
                  <TableCell>
                    {record.roster.map((user) => (
                      <Box key={user.id}>
                        {user.username}#{user.discriminator}
                        {record.submitterId === user.id ? " (creator)" : ""}
                      </Box>
                    ))}
                  </TableCell>
                  <TableCell>
                    {record.links.map((link) => (
                      <Box key={link} my={2}>
                        <MyLink href={link} isExternal>
                          {getLinkShorted(link)}
                        </MyLink>
                      </Box>
                    ))}
                  </TableCell>
                  <TableCell>
                    {record.goldenEggCount} eggs
                    <br />
                    {salmonRunCategoryToNatural[record.category]}
                    <br />
                    {new Date(record.rotation.startTime).toLocaleDateString()}
                    <br />
                    {record.rotation.stage}
                    <br />
                    {record.rotation.weapons.map((wpn) => (
                      <WeaponImage key={wpn} size={32} name={wpn} />
                    ))}
                  </TableCell>
                  <TableCell>
                    <Button
                      onClick={() => handleClick("PATCH", record.id)}
                      disabled={sending}
                      size="sm"
                    >
                      Approve
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Button
                      onClick={() => {
                        if (
                          window.confirm(
                            `Delete record on ${record.rotation.stage} with ${record.goldenEggCount} eggs permanently?`
                          )
                        ) {
                          handleClick("DELETE", record.id);
                        }
                      }}
                      colorScheme="red"
                      disabled={sending}
                      size="sm"
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </>
  );

  function getLinkShorted(link: string) {
    return (
      link.replace("https://", "").replace("www.", "").substring(0, 15) + "..."
    );
  }
};

export default SalmonRunAdminPage;
