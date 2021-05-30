import { useEffect, useRef } from "react";

const Video = ({
  clipName,
  time,
  playbackRate,
}: {
  clipName: "trailer1";
  time: { start: number; end: number };
  playbackRate?: number;
}) => {
  const ref = useRef<HTMLVideoElement>(null);

  const src = `/splatoon3/${clipName}.mp4#t=${time.start},${time.end}`;

  function loopVideoIfNeeded() {
    const video = ref.current;
    if (!video) return;
    if (video.currentTime > time.end) {
      video.currentTime = time.start;
      video.play();
    }
  }

  useEffect(() => {
    if (!ref.current) return;

    ref.current.addEventListener("timeupdate", loopVideoIfNeeded);

    return () => {
      ref.current?.removeEventListener("timeupdate", loopVideoIfNeeded);
    };
  }, [ref.current]);

  useEffect(() => {
    if (!ref.current || !playbackRate) return;

    ref.current.playbackRate = playbackRate;
  }, [ref.current]);

  return (
    <video
      ref={ref}
      src={src}
      playsInline
      loop
      controls
      /*autoPlay*/ muted
      width="500"
    />
  );
};

export default Video;
