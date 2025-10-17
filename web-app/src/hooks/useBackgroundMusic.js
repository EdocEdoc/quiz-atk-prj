import { useEffect, useRef } from "react";
import { Howl } from "howler";

export default function useBackgroundMusic(src, options = {}) {
  const soundRef = useRef(null);

  useEffect(() => {
    const sound = new Howl({
      src: [src],
      loop: options.loop ?? true,
      volume: options.volume ?? 0.3,
      html5: true,
    });

    soundRef.current = sound;

    // Start after user interaction (browsers block autoplay)
    const startMusic = () => {
      if (!sound.playing()) sound.play();
      window.removeEventListener("click", startMusic);
    };

    window.addEventListener("click", startMusic);

    return () => {
      sound.stop();
      sound.unload();
      window.removeEventListener("click", startMusic);
    };
  }, [src]);

  return soundRef.current;
}
