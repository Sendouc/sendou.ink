import { useMutation } from "@apollo/client";
import { Box, Button, Flex, useToast } from "@chakra-ui/core";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { ADD_BUILD } from "../../graphql/mutations/addBuild";
import { DELETE_BUILD } from "../../graphql/mutations/deleteBuild";
import { UPDATE_BUILD } from "../../graphql/mutations/updateBuild";
import {
  Ability,
  Build,
  ClothingGear,
  ClothingOnlyAbility,
  HeadGear,
  HeadOnlyAbility,
  ShoesGear,
  ShoesOnlyAbility,
  StackableAbility,
  Weapon,
} from "../../types";
import {
  clothingOnlyAbilities,
  clothingSelectOptions,
  headOnlyAbilities,
  headSelectOptions,
  shoesOnlyAbilities,
  shoesSelectOptions,
} from "../../utils/lists";
import GearImage from "../builds/GearImage";
import ViewSlots from "../builds/ViewSlots";
import WeaponImage from "../common/WeaponImage";
import WeaponSelector from "../common/WeaponSelector";
import Input from "../elements/Input";
import Modal from "../elements/Modal";
import Select from "../elements/Select";
import TextArea from "../elements/TextArea";
import AbilityButtons from "./AbilityButtons";

interface BuildFormModalProps {
  existingGear: ExistingGearObject;
  closeModal: () => void;
  buildBeingEdited?: Build | null;
}

type ExistingGearObject = Record<
  Partial<HeadGear | ClothingGear | ShoesGear>,
  Ability[]
>;

const BuildFormModal: React.FC<BuildFormModalProps> = ({
  existingGear,
  closeModal,
  buildBeingEdited,
}) => {
  const { t } = useTranslation();
  const toast = useToast();
  const [build, setBuild] = useState<Partial<Build>>(
    buildBeingEdited
      ? buildBeingEdited
      : {
          headgear: ["UNKNOWN", "UNKNOWN", "UNKNOWN", "UNKNOWN"],
          clothing: ["UNKNOWN", "UNKNOWN", "UNKNOWN", "UNKNOWN"],
          shoes: ["UNKNOWN", "UNKNOWN", "UNKNOWN", "UNKNOWN"],
        }
  );

  const [addBuild, { loading: addLoading }] = useMutation<
    { addBuild: Build },
    Build
  >(ADD_BUILD, {
    variables: { ...(build as Build) },
    onCompleted: (data) => {
      closeModal();
      toast({
        description: t("users;New build created"),
        position: "top-right",
        status: "success",
        duration: 10000,
      });
    },
    onError: (error) => {
      toast({
        title: t("users;An error occurred"),
        description: error.message,
        position: "top-right",
        status: "error",
        duration: 10000,
      });
    },
    refetchQueries: ["searchForBuilds"],
  });

  const [updateBuild, { loading: updateLoading }] = useMutation<
    { updateBuild: Build },
    Build
  >(UPDATE_BUILD, {
    variables: { ...(build as Build) },
    onCompleted: () => {
      closeModal();
      toast({
        description: t("users;Build updated"),
        position: "top-right",
        status: "success",
        duration: 10000,
      });
    },
    onError: (error) => {
      toast({
        title: t("users;An error occurred"),
        description: error.message,
        position: "top-right",
        status: "error",
        duration: 10000,
      });
    },
    refetchQueries: ["searchForBuilds"],
  });

  const [deleteBuild, { loading: deleteLoading }] = useMutation<
    boolean,
    { id: string }
  >(DELETE_BUILD, {
    variables: { id: build.id as string },
    onCompleted: () => {
      closeModal();
      toast({
        description: t("users;Build deleted"),
        position: "top-right",
        status: "success",
        duration: 10000,
      });
    },
    onError: (error) => {
      toast({
        title: t("users;An error occurred"),
        description: error.message,
        position: "top-right",
        status: "error",
        duration: 10000,
      });
    },
    refetchQueries: ["searchForBuilds"],
  });

  const handleChange = (value: Object) => setBuild({ ...build, ...value });

  const handleAbilityButtonClick = (ability: Ability) => {
    if (headOnlyAbilities.indexOf(ability as any) !== -1) {
      if (build.headgear![0] === "UNKNOWN") {
        handleChange({
          headgear: [
            ability,
            build.headgear![1],
            build.headgear![2],
            build.headgear![3],
          ],
        });
      }
    } else if (clothingOnlyAbilities.indexOf(ability as any) !== -1) {
      if (build.clothing![0] === "UNKNOWN") {
        handleChange({
          clothing: [
            ability,
            build.clothing![1],
            build.clothing![2],
            build.clothing![3],
          ],
        });
      }
    } else if (shoesOnlyAbilities.indexOf(ability as any) !== -1) {
      if (build.shoes![0] === "UNKNOWN") {
        handleChange({
          shoes: [ability, build.shoes![1], build.shoes![2], build.shoes![3]],
        });
      }
    } else {
      const headI = build.headgear!.indexOf("UNKNOWN");
      if (headI !== -1) {
        const copy = build.headgear!.slice();
        copy[headI] = ability as HeadOnlyAbility | StackableAbility;
        handleChange({
          headgear: copy,
        });
        return;
      }

      const clothingI = build.clothing!.indexOf("UNKNOWN");
      if (clothingI !== -1) {
        const copy = build.clothing!.slice();
        copy[clothingI] = ability as ClothingOnlyAbility | StackableAbility;
        handleChange({
          clothing: copy,
        });
        return;
      }

      const shoesI = build.shoes!.indexOf("UNKNOWN");
      if (shoesI !== -1) {
        const copy = build.shoes!.slice();
        copy[shoesI] = ability as ShoesOnlyAbility | StackableAbility;
        handleChange({
          shoes: copy,
        });
      }
    }
  };

  const handleClickBuildAbility = (
    slot: "HEAD" | "CLOTHING" | "SHOES",
    index: number
  ) => {
    if (slot === "HEAD") {
      const copy = build.headgear!.slice();
      copy[index] = "UNKNOWN";
      handleChange({
        headgear: copy,
      });
    } else if (slot === "CLOTHING") {
      const copy = build.clothing!.slice();
      copy[index] = "UNKNOWN";
      handleChange({
        clothing: copy,
      });
    } else {
      const copy = build.shoes!.slice();
      copy[index] = "UNKNOWN";
      handleChange({
        shoes: copy,
      });
    }
  };

  const buildCanBeSubmitted = () => {
    if (!build.weapon) {
      return false;
    }

    const abilitiesFilled =
      build.headgear?.every((ability) => ability !== "UNKNOWN") &&
      build.clothing?.every((ability) => ability !== "UNKNOWN") &&
      build.shoes?.every((ability) => ability !== "UNKNOWN");

    if (!abilitiesFilled) {
      return false;
    }

    return true;
  };

  return (
    <Modal
      title={
        buildBeingEdited
          ? t("users;Editing existing build")
          : t("users;Adding a new build")
      }
      closeModal={() => closeModal()}
    >
      {buildBeingEdited && !deleteLoading && (
        <Box
          color="red.500"
          mb="1em"
          textDecoration="underline"
          cursor="pointer"
          onClick={() => deleteBuild()}
        >
          {t("users;Delete build")}
        </Box>
      )}
      <WeaponSelector
        required
        label={t("users;Weapon")}
        setValue={(weapon: Weapon) => handleChange({ weapon })}
        value={build.weapon}
        showAlts
      />
      {build.weapon && (
        <WeaponImage englishName={build.weapon as Weapon} size="BIG" />
      )}
      <Flex mt="1em" justifyContent="space-between" flexWrap="wrap">
        <Flex flexDirection="column" alignItems="center">
          <Box minW="275px">
            <Select
              label={t("users;Headgear")}
              options={headSelectOptions}
              clearable
              isSearchable
              value={build.headgearItem}
              setValue={(headgearItem: HeadGear) => {
                if (
                  (!build.headgear ||
                    build.headgear.every((ability) => ability === "UNKNOWN")) &&
                  existingGear.hasOwnProperty(headgearItem)
                ) {
                  handleChange({
                    headgearItem,
                    headgear: existingGear[headgearItem],
                  });
                } else {
                  handleChange({ headgearItem });
                }
              }}
            />
          </Box>
          {build.headgearItem && (
            <Box mt="0.5em">
              <GearImage englishName={build.headgearItem} />
            </Box>
          )}
        </Flex>
        <Flex flexDirection="column" alignItems="center">
          <Box minW="275px">
            <Select
              label={t("users;Clothing")}
              options={clothingSelectOptions}
              clearable
              isSearchable
              value={build.clothingItem}
              setValue={(clothingItem: ClothingGear) => {
                if (
                  (!build.clothing ||
                    build.clothing.every((ability) => ability === "UNKNOWN")) &&
                  existingGear.hasOwnProperty(clothingItem)
                ) {
                  handleChange({
                    clothingItem,
                    clothing: existingGear[clothingItem],
                  });
                } else {
                  handleChange({ clothingItem });
                }
              }}
            />
          </Box>
          {build.clothingItem && (
            <Box mt="0.5em">
              <GearImage englishName={build.clothingItem} />
            </Box>
          )}
        </Flex>
        <Flex flexDirection="column" alignItems="center">
          <Box minW="275px">
            <Select
              label={t("users;Shoes")}
              options={shoesSelectOptions}
              clearable
              isSearchable
              value={build.shoesItem}
              setValue={(shoesItem: ShoesGear) => {
                if (
                  (!build.shoes ||
                    build.shoes.every((ability) => ability === "UNKNOWN")) &&
                  existingGear.hasOwnProperty(shoesItem)
                ) {
                  handleChange({
                    shoesItem,
                    shoes: existingGear[shoesItem],
                  });
                } else {
                  handleChange({ shoesItem });
                }
              }}
            />
          </Box>
          {build.shoesItem && (
            <Box mt="0.5em">
              <GearImage englishName={build.shoesItem} />
            </Box>
          )}
        </Flex>
      </Flex>
      <Box mt="1em">
        <Input
          value={build.title}
          setValue={(value: string) => handleChange({ title: value })}
          label={t("users;Title")}
          limit={100}
        />
      </Box>
      <Box mt="1em">
        <ViewSlots build={build} onAbilityClick={handleClickBuildAbility} />
      </Box>
      <Box mt="1em">
        <AbilityButtons
          onClick={(ability) => handleAbilityButtonClick(ability)}
        />
      </Box>
      <Box mt="1em">
        <TextArea
          value={build.description}
          setValue={(value: string) => handleChange({ description: value })}
          label={t("users;Description")}
          limit={1000}
        />
      </Box>
      <Box mt="1em">
        <Button
          disabled={!buildCanBeSubmitted()}
          onClick={buildBeingEdited ? () => updateBuild() : () => addBuild()}
          isLoading={addLoading || updateLoading}
        >
          {t("users;Submit")}
        </Button>
        <Box as="span" ml="0.5em">
          <Button variant="outline" onClick={() => closeModal()}>
            {t("users;Cancel")}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default BuildFormModal;
