import Image from "next/image";
import { CSSProperties } from "react";

interface ModeImageProps {
  mode: "TW" | "SZ" | "TC" | "RM" | "CB";
  size?: 24 | 32 | 64 | 128;
  onClick?: () => void;
  style?: CSSProperties;
}

const ModeImage: React.FC<ModeImageProps> = ({ mode, size = 32, onClick }) => {
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
