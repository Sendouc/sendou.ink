import Image from "next/image";

interface ModeImageProps {
  mode: "SZ" | "TC" | "RM" | "CB";
  size: 32 | 64 | 128;
}

const ModeImage: React.FC<ModeImageProps> = ({ mode, size }) => {
  return <Image src={`/modes/${mode}.png`} width={size} height={size} />;
};

export default ModeImage;
