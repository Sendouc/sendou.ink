import { Flex } from "@chakra-ui/react";
import { Trans } from "@lingui/macro";
import AbilityIcon from "components/common/AbilityIcon";
import SubText from "components/common/SubText";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "components/common/Table";
import { mainOnlyAbilities } from "utils/lists/abilities";

interface Props {
  stats: {
    code: string;
    average: number;
    counts: number[][];
  }[];
}

const APStats: React.FC<Props> = ({ stats }) => {
  if (Number.isNaN(stats[0].average)) return null;
  return (
    <Flex justify="space-evenly" flexWrap="wrap">
      <Table maxW={64} mt={6}>
        <TableHead>
          <TableRow>
            <TableHeader>
              <Trans>Ability</Trans>
            </TableHeader>
            <TableHeader>
              <Trans>Average AP</Trans>
            </TableHeader>
            <TableHeader>
              <Trans>Popular values</Trans>
            </TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {stats
            .filter((stat) => !mainOnlyAbilities.includes(stat.code as any))
            .map((stat) => {
              return (
                <TableRow key={stat.code}>
                  <TableCell>
                    <AbilityIcon ability={stat.code} size="TINY" />
                  </TableCell>
                  <TableCell fontWeight="bold">
                    {stat.average.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {stat.counts.map((count) => {
                      return (
                        <Flex align="center" key={count[0]}>
                          {count[0]} <SubText ml={1}>{count[1]}</SubText>
                        </Flex>
                      );
                    })}
                  </TableCell>
                </TableRow>
              );
            })}
        </TableBody>
      </Table>

      <Table maxW={64} mt={6}>
        <TableHead>
          <TableRow>
            <TableHeader>
              <Trans>Ability</Trans>
            </TableHeader>
            <TableHeader>
              <Trans>Appearance %</Trans>
            </TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {stats
            .filter((stat) => mainOnlyAbilities.includes(stat.code as any))
            .map((stat) => {
              return (
                <TableRow key={stat.code}>
                  <TableCell>
                    <AbilityIcon ability={stat.code} size="TINY" />
                  </TableCell>
                  <TableCell fontWeight="bold">
                    {(stat.average * 10).toFixed(2)}%
                  </TableCell>
                </TableRow>
              );
            })}
        </TableBody>
      </Table>
    </Flex>
  );
};

export default APStats;
