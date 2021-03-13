import Image from "next/image";

export default function Flag({ countryCode }: { countryCode: string }) {
  return (
    <Image
      width={16}
      height={16}
      src={`https://www.countryflags.io/${countryCode}/flat/16.png`}
    />
  );
}
