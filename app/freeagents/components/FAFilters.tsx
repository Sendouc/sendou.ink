import {
  Box,
  Center,
  FormControl,
  FormLabel,
  Grid,
  Radio,
  RadioGroup,
  Stack,
  Switch,
} from "@chakra-ui/react";
import { Trans } from "@lingui/macro";
import { Playstyle } from "@prisma/client";
import MySelect from "components/common/MySelect";
import WeaponSelector from "components/common/WeaponSelector";
import { UseFreeAgentsDispatch, UseFreeAgentsState } from "../hooks";

const regionOptions = [
  {
    label: "Americas",
    value: "AMERICAS",
  },
  {
    label: "Europe",
    value: "EUROPE",
  },
  {
    label: "Asia/Oceania",
    value: "ASIA",
  },
] as const;

export default function FAFilters({
  state,
  dispatch,
}: {
  state: UseFreeAgentsState;
  dispatch: UseFreeAgentsDispatch;
}) {
  return (
    <Box>
      <Grid
        gridTemplateColumns={["1fr", "1fr 1fr"]}
        gridRowGap={[2, 4]}
        gridColumnGap="1rem"
        mt={4}
      >
        <FormControl display="flex" alignItems="center">
          <FormLabel htmlFor="xp" mb="0">
            Show Top 500 only
          </FormLabel>
          <Switch
            id="xp"
            isChecked={state.xp}
            onChange={(e) =>
              dispatch({ type: "SET_XP_VALUE", value: e.target.checked })
            }
          />
        </FormControl>
        <FormControl display="flex" alignItems="center">
          <FormLabel htmlFor="plus-server" mb="0">
            Show Plus Server members only
          </FormLabel>
          <Switch
            id="plus-server"
            isChecked={state.plusServer}
            onChange={(e) =>
              dispatch({
                type: "SET_PLUS_SERVER_VALUE",
                value: e.target.checked,
              })
            }
          />
        </FormControl>
        <FormControl>
          <FormLabel htmlFor="weapon">Filter by weapon</FormLabel>

          <WeaponSelector
            isMulti={false}
            isClearable
            value={state.weapon ?? null}
            setValue={(value) => dispatch({ type: "SET_WEAPON", value })}
          />
        </FormControl>
        <FormControl>
          <FormLabel htmlFor="region">Filter by region</FormLabel>
          <MySelect
            name="region"
            isMulti={false}
            isClearable
            value={
              regionOptions.find((option) => state.region === option.value) ??
              null
            }
            options={regionOptions}
            setValue={(value) => dispatch({ type: "SET_REGION", value })}
          />
        </FormControl>
      </Grid>
      <FormControl>
        <FormLabel htmlFor="roles" textAlign="center" mt={4}>
          Filter by role
        </FormLabel>

        <Center>
          <RadioGroup
            name="roles"
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
      </FormControl>
    </Box>
  );
}
