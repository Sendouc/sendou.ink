import { Box, Button, FormLabel, Select } from "@chakra-ui/react";
import { t, Trans } from "@lingui/macro";
import { useLingui } from "@lingui/react";
import SubText from "components/common/SubText";
import WeaponImage from "components/common/WeaponImage";
import WeaponSelector from "components/common/WeaponSelector";
import { useMyTheme } from "hooks/common";
import { GetAllSalmonRunRotationsData } from "prisma/queries/getAllSalmonRunRotations";
import { useState } from "react";
import useSWR from "swr";
import { salmonRunStages } from "utils/lists/stages";

export const randomToNaturalName = {
  RANDOM: t`Random`,
  RANDOM_GRIZZCO: t`Random (Grizzco)`,
} as const;

interface Props {
  rotationId?: number;
  setRotationId: (id: number | null) => void;
}

const RotationSelector: React.FC<Props> = ({ rotationId, setRotationId }) => {
  const { gray } = useMyTheme();
  const { i18n } = useLingui();
  const { data } = useSWR<GetAllSalmonRunRotationsData>("/api/sr/rotations");

  const [stage, setStage] = useState("Spawning Grounds");
  const [weapons, setWeapons] = useState<string[]>([]);

  const filteredRotations = getFilteredRotations();

  if (rotationId && data) {
    const rotation = data.find((rotation) => rotation.id === rotationId)!;
    return (
      <Box>
        <SubText>
          <Trans>Selected rotation</Trans>
        </SubText>
        <Box my={2} fontWeight="bold">
          #{rotation.id}
        </Box>
        <Box my={1}>{i18n._(rotation.stage)}</Box>
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
            onClick={() => setRotationId(null)}
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
        <WeaponSelector
          value={weapons}
          setValue={setWeapons}
          isMulti
          pool="SALMON_RUN"
          isClearable={false}
          maxMultiCount={4}
        />
      </Box>
      {filteredRotations && filteredRotations.length > 0 && (
        <Box mt={4}>
          <FormLabel htmlFor="rotation">
            <Trans>Rotation</Trans>
          </FormLabel>
          <Select
            name="rotation"
            value="NO_VALUE"
            onChange={(e) => setRotationId(parseInt(e.target.value))}
          >
            <option hidden value="NO_VALUE">
              {t`Select rotation`}
            </option>
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
      {filteredRotations && filteredRotations.length === 0 && (
        <Box mt={2} color="red.500">
          <Trans>
            No rotations matching with this criteria. Please choose different
            weapons.
          </Trans>
        </Box>
      )}
    </>
  );

  function getFilteredRotations() {
    if (!data) return null;
    if (!stage || weapons.length === 0) return null;
    return data;
  }
};

export default RotationSelector;
