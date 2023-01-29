import LiteYouTubeEmbed from "react-lite-youtube-embed";
import { Main } from "~/components/Main";

export default function NewVodPage() {
  return (
    <Main>
      <LiteYouTubeEmbed
        id="xxx"
        title="What’s new in Material Design for the web (Chrome Dev Summit 2019)"
      />
    </Main>
  );
}
