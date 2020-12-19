import { Button } from "@chakra-ui/react";
import { t } from "@lingui/macro";
import Breadcrumbs from "components/common/Breadcrumbs";
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
import { SALMON_RUN_ADMIN_DISCORD_IDS } from "lib/constants";
import useUser from "lib/useUser";
import { useRouter } from "next/router";
import { GetAllSalmonRunRecordsData } from "prisma/queries/getAllSalmonRunRecords";
import useSWR from "swr";

const SalmonRunAdminPage = ({}) => {
  const router = useRouter();
  const [user, loading] = useUser();
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

  console.log("admin page data", data);
  return (
    <>
      <Breadcrumbs
        pages={[
          { name: t`Salmon Run` },
          { name: t`Leaderboards`, link: "/sr/leaderboards" },
          { name: "Admin" },
        ]}
      />
      {data.length === 0 ? (
        <>no results</>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>Created</TableHeader>
              <TableHeader>Users</TableHeader>
              <TableHeader width={4}>Links</TableHeader>
              <TableHeader>Rotation</TableHeader>
              <TableHeader />
              <TableHeader />
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((record) => {
              return (
                <TableRow key={record.id}>
                  <TableCell>{record.createdAt.toLocaleString()}</TableCell>
                  <TableCell>
                    {record.roster
                      .map(
                        (user) =>
                          `${user.username}#${user.discriminator}${
                            record.submitterId === user.id ? " (creator)" : ""
                          }`
                      )
                      .join("\n")}
                  </TableCell>
                  <TableCell width={4}>
                    {record.links.map((link) => (
                      <MyLink key={link} href={link} isExternal>
                        {getLinkShorted(link)}
                      </MyLink>
                    ))}
                  </TableCell>
                  <TableCell>
                    {record.goldenEggCount} eggs
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
                    <Button>Approve</Button>
                  </TableCell>
                  <TableCell>
                    <Button colorScheme="red">Delete</Button>
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
