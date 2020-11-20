import { Box, Flex } from "@chakra-ui/react";
import { Trans } from "@lingui/macro";
import WeaponImage from "components/common/WeaponImage";
import { weapons } from "lib/lists/weapons";
import { useMyTheme } from "lib/useMyTheme";
import Image from "next/image";
import { useState } from "react";
import Draggable from "react-draggable";

interface DraggableImageAdderProps {
  addImageToSketch: (imgSrc: string) => void;
}

const DraggableImageAdder: React.FC<DraggableImageAdderProps> = ({
  addImageToSketch,
}) => {
  const { bgColor } = useMyTheme();
  const [activeDrags, setActiveDrags] = useState(0);

  const onStart = () => {
    setActiveDrags(activeDrags + 1);
  };

  const onStop = () => {
    setActiveDrags(activeDrags - 1);
  };

  return (
    <Draggable handle="strong" onStart={onStart} onStop={onStop}>
      <Box
        position="fixed"
        zIndex={999}
        borderRadius="7px"
        boxShadow="7px 14px 13px 2px rgba(0,0,0,0.24)"
        bg={bgColor}
        textAlign="center"
        width="119px"
        ml="950px"
      >
        <strong style={{ cursor: "move" }}>
          <div
            style={{
              fontSize: "17px",
              borderRadius: "7px 7px 0 0",
              padding: "0.3em",
            }}
          >
            <Trans>Add image</Trans>
          </div>
        </strong>
        <Box overflowY="scroll" height="50vh">
          <Flex flexWrap="wrap">
            {weapons.map((wpn) => (
              <Box
                key={wpn}
                onClick={() =>
                  addImageToSketch(
                    `/images/weapons/${wpn.replace(".", "")}.png`
                  )
                }
                m="3px"
              >
                <WeaponImage name={wpn} size={32} />
              </Box>
            ))}
            {["Blaster", "Brella", "Charger", "Slosher"].map(
              (grizzcoWeaponClass) => {
                const imgSrc = `/weapons/Grizzco ${grizzcoWeaponClass}.png`;
                return (
                  <Box m="3px">
                    <Image
                      key={grizzcoWeaponClass}
                      onClick={() => addImageToSketch(imgSrc)}
                      src={imgSrc}
                      width={32}
                      height={32}
                    />
                  </Box>
                );
              }
            )}
            {["TC", "RM", "CB"].map((mode) => {
              const imgSrc = `/modes/${mode}.png`;
              return (
                <Box m="3px">
                  <Image
                    key={mode}
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
                <Box margin="3px">
                  <Image
                    key={boss}
                    onClick={() => addImageToSketch(imgSrc)}
                    src={imgSrc}
                    width={32}
                    height={32}
                  />
                </Box>
              );
            })}
          </Flex>
        </Box>
      </Box>
    </Draggable>
  );
};

export default DraggableImageAdder;
