import { IconButton } from "@chakra-ui/react";
import { FiLink, FiTwitter, FiYoutube } from "react-icons/fi";

const LinkButton = ({ link }: { link: string }) => {
  return (
    <a key={link} href={link}>
      <IconButton
        aria-label={`Link to ${link}`}
        icon={<LinkIcon link={link} />}
        isRound
        variant="ghost"
      />
    </a>
  );
};

function LinkIcon({ link }: { link: string }) {
  if (link.includes("youtube") || link.includes("youtu.be")) {
    return <FiYoutube />;
  }

  if (link.includes("twitter")) {
    return <FiTwitter />;
  }

  return <FiLink />;
}

export default LinkButton;
