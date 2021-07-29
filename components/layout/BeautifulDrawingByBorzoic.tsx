import { Image as ChakraImage, useColorMode } from "@chakra-ui/react";
import randomColor from "randomcolor";
import { useEffect, useState } from "react";
import { getFilters } from "utils/getFilters";

const BeautifulDrawingOfBorzoic = ({ type }: { type: "girl" | "boy" }) => {
  const [hexCode, setHexCode] = useState(randomColor());
  const { colorMode } = useColorMode();
  const [drawingImgSrc, setDrawingImgSrc] = useState(
    `/layout/new_${type}_${colorMode}.png`
  );
  const [drawingLoaded, setDrawingLoaded] = useState(false);

  const handleColorChange = () => setHexCode(randomColor());

  useEffect(() => {
    const loadImage = (imageUrl: string): Promise<string> => {
      return new Promise((resolve, reject) => {
        const loadImg = new Image();
        loadImg.src = imageUrl;
        loadImg.onload = () => setTimeout(() => resolve(imageUrl));
        loadImg.onerror = (err) => reject(err);
      });
    };

    loadImage(`/layout/new_${type}_${colorMode}.png`)
      .then((src) => setDrawingImgSrc(src))
      .catch((err) => console.error("Failed to load images", err));
  }, [type, colorMode]);

  return (
    <>
      <ChakraImage
        src={`/layout/new_${type}_bg.png`}
        filter={getFilters(hexCode)}
        height={["150px", "240px", "300px", "360px"]}
        gridColumn={type === "girl" ? "2 / 3" : "1 / 2"}
        justifySelf={type === "girl" ? "flex-start" : "flex-end"}
        gridRow="1"
        alt=""
        visibility={drawingLoaded ? "visible" : "hidden"}
      />
      <ChakraImage
        onClick={handleColorChange}
        onMouseEnter={handleColorChange}
        src={drawingImgSrc}
        height={["150px", "240px", "300px", "360px"]}
        gridColumn={type === "girl" ? "2 / 3" : "1 / 2"}
        justifySelf={type === "girl" ? "flex-start" : "flex-end"}
        gridRow="1"
        zIndex="10"
        alt=""
        onLoad={() => setDrawingLoaded(true)}
      />
    </>
  );
};

export default BeautifulDrawingOfBorzoic;
