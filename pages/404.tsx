import NextImage from "next/image";
import Heading from "components/elements/Heading";
import styles from "./404.module.css";

const splatoonOneMaps = [
  {
    image: "alfonsino",
    name: "Museum D'Alfonsino",
  },
  {
    image: "bluefin",
    name: "Bluefin Depot",
  },
  {
    image: "bridge",
    name: "Hammerhead Bridge",
  },
  {
    image: "flounder",
    name: "Flounder Heights",
  },
  {
    image: "resort",
    name: "Mahi-Mahi Resort",
  },
  {
    image: "rig",
    name: "Saltspray Rig",
  },
  {
    image: "underpass",
    name: "Urchin Underpass",
  },
] as const;

const NotFound = () => {
  const mapObject =
    splatoonOneMaps[Math.floor(Math.random() * splatoonOneMaps.length)];
  return (
    <div className={styles.container}>
      <NextImage
        className={styles.image}
        src={`/splatoon-1-maps/${mapObject.image}.png`}
        width={533}
        height={300}
        alt=""
      />
      <Heading className="mt-4">404 - Not Found</Heading>
      <div className="text-gray">
        ...just like {mapObject.name} can&apos;t be found in Splatoon 2
      </div>
    </div>
  );
};

export default NotFound;
