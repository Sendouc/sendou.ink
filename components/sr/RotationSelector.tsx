import { Box, Button, FormLabel, Select } from "@chakra-ui/react";
import { t, Trans } from "@lingui/macro";
import { useLingui } from "@lingui/react";
import MultiWeaponSelector from "components/common/MultiWeaponSelector";
import SubText from "components/common/SubText";
import WeaponImage from "components/common/WeaponImage";
import { salmonRunStages } from "lib/lists/stages";
import { useMyTheme } from "lib/useMyTheme";
import { GetAllSalmonRunRotationsData } from "prisma/queries/getAllSalmonRunRotations";
import { useState } from "react";
import useSWR from "swr";

const randomToNaturalName = {
  RANDOM: t`Random`,
  RANDOM_GRIZZCO: t`Random (Grizzco)`,
} as const;

interface Props {}

const RotationSelector: React.FC<Props> = ({}) => {
  const { gray } = useMyTheme();
  const { i18n } = useLingui();
  const { data } = useSWR<GetAllSalmonRunRotationsData>("/api/sr/rotations");

  const [stage, setStage] = useState("Spawning Grounds");
  const [weapons, setWeapons] = useState<string[]>([]);
  const [idSelected, setIdSelected] = useState<number | null>(null);

  const filteredRotations = getFilteredRotations();

  if (idSelected && data) {
    const rotation = data.find((rotation) => rotation.id === idSelected)!;
    return (
      <Box>
        <SubText>
          <Trans>Selected rotation</Trans>
        </SubText>
        <Box my={2} fontWeight="bold">
          #{rotation.id}
        </Box>
        <Box my={2} color={gray}>
          {new Date(rotation.startTime).toLocaleDateString()}
        </Box>
        {rotation.weapons.map((wpn, i) => (
          <Box as="span" mx={1} key={i}>
            <WeaponImage name={wpn} size={32} />
          </Box>
        ))}
        <Box my={2}>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIdSelected(null)}
          >
            <Trans>Change selection</Trans>
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <>
      <FormLabel htmlFor="stage">
        <Trans>Stage</Trans>
      </FormLabel>
      <Select
        name="stage"
        value={stage}
        onChange={(e) => setStage(e.target.value)}
      >
        {salmonRunStages.map((stage) => (
          <option key={stage} value={stage}>
            {i18n._(stage)}
          </option>
        ))}
      </Select>
      <Box mt={4}>
        <FormLabel htmlFor="weapons">
          <Trans>Weapons</Trans>
        </FormLabel>
        <MultiWeaponSelector
          name="weapons"
          value={weapons}
          onChange={setWeapons}
          isSalmonRun
        />
      </Box>
      {filteredRotations && (
        <Box mt={4}>
          <FormLabel htmlFor="rotation">
            <Trans>Rotation</Trans>
          </FormLabel>
          <Select
            name="rotation"
            onChange={(e) => setIdSelected(parseInt(e.target.value))}
          >
            {filteredRotations.map((rotation) => (
              <option key={rotation.id} value={rotation.id}>
                {new Date(rotation.startTime).toLocaleDateString()} -{" "}
                {rotation.weapons
                  .map((wpn) =>
                    wpn === "RANDOM" || wpn === "RANDOM_GRIZZCO"
                      ? randomToNaturalName[wpn]
                      : wpn
                  )
                  .join(", ")}
              </option>
            ))}
          </Select>
        </Box>
      )}
    </>
  );

  function getFilteredRotations() {
    if (!data) return null;
    if (!stage || weapons.length < 1) return null;
    return data.filter((rotation) => {
      return (
        rotation.stage === stage &&
        weapons.every((wpn) => rotation.weapons.includes(wpn))
      );
    });
  }
};

export default RotationSelector;
