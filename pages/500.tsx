import MyLink from "components/common/MyLink";
import Image from "next/image";
import Heading from "components/elements/Heading";

const Custom500Page = () => {
  return (
    <div className="flex-col align-center justify-center">
      <Image src={`/layout/errorGirl.png`} width={584} height={487} alt="" />
      <Heading>500 - Server-side error occurred</Heading>
      <div className="text-gray">
        For assistance please visit our{" "}
        <MyLink href="https://discord.gg/sendou" isExternal>
          Discord
        </MyLink>
      </div>
    </div>
  );
};

export default Custom500Page;
