import { Center, Radio, RadioGroup, Stack } from "@chakra-ui/react";
import { Trans } from "@lingui/macro";
import { Playstyle } from "@prisma/client";
import { UseFreeAgentsDispatch, UseFreeAgentsState } from "../hooks";

export default function FAFilters({
  state,
  dispatch,
}: {
  state: UseFreeAgentsState;
  dispatch: UseFreeAgentsDispatch;
}) {
  return (
    <Center mt={6}>
      <RadioGroup
        value={state.playstyle ?? "ALL"}
        onChange={(value) =>
          dispatch({
            type: "SET_PLAYSTYLE",
            playstyle: value === "ALL" ? undefined : (value as Playstyle),
          })
        }
      >
        <Stack spacing={4} direction={["column", "row"]}>
          <Radio value="ALL">All</Radio>
          <Radio value="FRONTLINE">
            <Trans>Frontline</Trans>
          </Radio>
          <Radio value="MIDLINE">
            <Trans>Support</Trans>
          </Radio>
          <Radio value="BACKLINE">
            <Trans>Backline</Trans>
          </Radio>
        </Stack>
      </RadioGroup>
    </Center>
  );
}
