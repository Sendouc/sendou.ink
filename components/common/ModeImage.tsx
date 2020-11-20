import Image from "next/image";
import { CSSProperties } from "react";

interface ModeImageProps {
  mode: "SZ" | "TC" | "RM" | "CB";
  size: 32 | 64 | 128;
  onClick?: () => void;
  style?: CSSProperties;
}

const ModeImage: React.FC<ModeImageProps> = ({ mode, size, onClick }) => {
  return (
    <Image
      src={`/modes/${mode}.png`}
      width={size}
      height={size}
      onClick={onClick}
    />
  );
};

export default ModeImage;
