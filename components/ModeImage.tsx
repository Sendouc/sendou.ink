import { Image, ImageProps } from "@chakra-ui/core";

interface ModeImageProps {
  mode: "SZ" | "TC" | "RM" | "CB";
}

const ModeImage: React.FC<ModeImageProps & ImageProps> = ({
  mode,
  ...props
}) => {
  return <Image src={`/modes/${mode}.png`} {...props} />;
};

export default ModeImage;
