import Image from "next/image";

export default function Flag({ countryCode }: { countryCode: string }) {
  return (
    <Image
      width={16}
      height={16}
      src={`https://flagcdn.com/w20/${countryCode}.png`}
      alt={`Flag with country code ${countryCode}`}
    />
  );
}
