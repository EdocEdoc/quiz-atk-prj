import { Howl } from "howler";

let bgMusicInstance = null;

export function setBackgroundMusicInstance(instance) {
  bgMusicInstance = instance;
}

export function playEffect(src, volume = 0.6) {
  return new Promise((resolve) => {
    const effect = new Howl({
      src: [src],
      volume,
      onplay: () => {
        if (bgMusicInstance && bgMusicInstance.playing()) {
          bgMusicInstance.pause();
        }
      },
      onend: () => {
        if (bgMusicInstance && !bgMusicInstance.playing()) {
          bgMusicInstance.play();
        }
        resolve();
      },
    });

    effect.play();
  });
}
