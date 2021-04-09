import {
  Box,
  Center,
  FormControl,
  FormLabel,
  Radio,
  RadioGroup,
  Stack,
  Switch,
} from "@chakra-ui/react";
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
    <Box>
      <FormControl display="flex" alignItems="center">
        <FormLabel htmlFor="xp" mb="0">
          Show Top 500 only
        </FormLabel>
        <Switch
          id="xp"
          onChange={(e) =>
            dispatch({ type: "SET_XP_VALUE", value: e.target.checked })
          }
        />
      </FormControl>
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
    </Box>
  );
}
