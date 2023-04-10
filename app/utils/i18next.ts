import type { DamageType } from "~/features/build-analyzer";

// TODO: type this correctly
export const damageTypeTranslationString = ({
  damageType,
}: {
  damageType: DamageType;
}): any => `analyzer:damage.${damageType as "NORMAL_MIN"}`;
