import { Box, Flex } from "@chakra-ui/react";
import WeaponImage from "components/common/WeaponImage";
import Image from "next/image";
import { weapons } from "utils/lists/weapons";

interface ImageAdderProps {
  addImageToSketch: (imgSrc: string) => void;
}

const SUB_WEAPON_CODES = [
  "Bomb_Curling",
  "Bomb_Piyo",
  "Bomb_Quick",
  "Bomb_Robo",
  "Bomb_Splash",
  "Bomb_Suction",
  "Bomb_Tako",
  "Flag",
  "PointSensor",
  "PoisonFog",
  "Shield",
  "Sprinkler",
  "TimerTrap",
];

const SPECIAL_WEAPON_CODES = [
  "AquaBall",
  "Jetpack",
  "LauncherCurling",
  "LauncherQuick",
  "LauncherRobo",
  "LauncherSplash",
  "LauncherSuction",
  "RainCloud",
  "SuperArmor",
  "SuperBall",
  "SuperBubble",
  "SuperLanding",
  "SuperMissile",
  "SuperStamp",
  "WaterCutter",
];

const ImageAdder = ({ addImageToSketch }: ImageAdderProps) => {
  return (
    <Flex flexWrap="wrap" w="72rem" mt={4} mx="3" justify="center">
      {weapons.map((wpn) => (
        <Box
          key={wpn}
          onClick={() =>
            addImageToSketch(`/weapons/${wpn.replace(".", "")}.png`)
          }
          m="3px"
        >
          <WeaponImage name={wpn} size={32} />
        </Box>
      ))}
      {["Blaster", "Brella", "Charger", "Slosher"].map((grizzcoWeaponClass) => {
        const imgSrc = `/weapons/Grizzco ${grizzcoWeaponClass}.png`;
        return (
          <Box key={grizzcoWeaponClass} m="3px">
            <Image
              onClick={() => addImageToSketch(imgSrc)}
              src={imgSrc}
              width={32}
              height={32}
            />
          </Box>
        );
      })}
      {SUB_WEAPON_CODES.map((code) => {
        const imgSrc = `/subs-specials/Wsb_${code}.png`;
        return (
          <Box key={code} m="3px">
            <Image
              onClick={() => addImageToSketch(imgSrc)}
              src={imgSrc}
              width={32}
              height={32}
            />
          </Box>
        );
      })}
      {SPECIAL_WEAPON_CODES.map((code) => {
        const imgSrc = `/subs-specials/Wsp_${code}.png`;
        return (
          <Box key={code} m="3px">
            <Image
              onClick={() => addImageToSketch(imgSrc)}
              src={imgSrc}
              width={32}
              height={32}
            />
          </Box>
        );
      })}
      {["TC", "RM", "CB"].map((mode) => {
        const imgSrc = `/modes/${mode}.png`;
        return (
          <Box key={mode} m="3px">
            <Image
              onClick={() => addImageToSketch(imgSrc)}
              src={imgSrc}
              width={32}
              height={32}
            />
          </Box>
        );
      })}
      {[
        "Drizzler",
        "Flyfish",
        "Goldie",
        "Griller",
        "Maws",
        "Scrapper",
        "Steel Eal",
        "Steelhead",
        "Stinger",
        "Golden Egg",
      ].map((boss) => {
        const imgSrc = `/images/salmonRunIcons/${boss}.png`;
        return (
          <Box key={boss} m="3px">
            <Image
              onClick={() => addImageToSketch(imgSrc)}
              src={imgSrc}
              width={32}
              height={32}
            />
          </Box>
        );
      })}
    </Flex>
  );
};

export default ImageAdder;
