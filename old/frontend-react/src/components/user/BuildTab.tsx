import { Box, Button } from "@chakra-ui/react";
import useLocalStorage from "@rehooks/local-storage";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Ability, Build, ClothingGear, HeadGear, ShoesGear } from "../../types";
import BuildCard from "../builds/BuildCard";
import Alert from "../elements/Alert";
import Input from "../elements/Input";
import BuildFormModal from "./BuildFormModal";

interface BuildTabProps {
  builds: Build[];
  canModifyBuilds: boolean;
  unlimitedBuilds: boolean;
}

type ExistingGearObject = Record<
  Partial<HeadGear | ClothingGear | ShoesGear>,
  Ability[]
>;

const buildsReducer = (acc: ExistingGearObject, cur: Build) => {
  if (cur.headgearItem) {
    acc[cur.headgearItem] = [...cur.headgear];
  }
  if (cur.clothingItem) {
    acc[cur.clothingItem] = [...cur.clothing];
  }
  if (cur.shoesItem) {
    acc[cur.shoesItem] = [...cur.shoes];
  }
  return acc;
};

const BuildTab: React.FC<BuildTabProps> = ({
  builds,
  canModifyBuilds,
  unlimitedBuilds,
}) => {
  const [APView] = useLocalStorage<boolean>("prefersAPView");
  const [formOpen, setFormOpen] = useState(false);
  const [buildBeingEdited, setBuildBeingEdited] = useState<Build | null>(null);
  const [buildFilter, setBuildFilter] = useState("");
  const { t } = useTranslation();

  const existingGear = builds
    ? builds.reduce(buildsReducer, {} as ExistingGearObject)
    : ({} as ExistingGearObject);

  const canAddBuilds = builds.length < 100 || unlimitedBuilds;

  const filterLower = buildFilter.toLowerCase();
  const filteredBuilds = !buildFilter
    ? builds
    : builds.filter(
        (build) =>
          build.title?.toLowerCase().includes(filterLower) ||
          build.weapon.toLowerCase().includes(filterLower)
      );

  return (
    <>
      {formOpen && (
        <BuildFormModal
          existingGear={existingGear}
          closeModal={() => {
            setFormOpen(false);
            setBuildBeingEdited(null);
          }}
          buildBeingEdited={buildBeingEdited}
        />
      )}
      {canModifyBuilds && canAddBuilds && (
        <Button onClick={() => setFormOpen(true)}>
          {t("users;Add build")}
        </Button>
      )}
      {canModifyBuilds && !canAddBuilds && (
        <Alert status="info">{t("users;tooManyBuilds")}</Alert>
      )}
      {builds.length > 10 && (
        <Box mb="2rem">
          <Input
            label={t("users;Filter builds by title or weapon")}
            value={buildFilter}
            setValue={setBuildFilter}
          />
        </Box>
      )}
      <Box
        display="flex"
        flexWrap="wrap"
        mt="1em"
        width="80vw"
        position="relative"
        left="50%"
        right="50%"
        mx="-40vw"
        justifyContent="center"
      >
        {filteredBuilds.map((build) => (
          <BuildCard
            canModify={canModifyBuilds}
            setBuildBeingEdited={(build: Build) => {
              setBuildBeingEdited(build);
              setFormOpen(true);
            }}
            key={build.id}
            build={build}
            defaultToAPView={APView !== null ? APView : false}
            m="0.5em"
          />
        ))}
      </Box>
    </>
  );
};

export default BuildTab;
