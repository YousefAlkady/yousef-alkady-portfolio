// iPhone Safari ignores a `preload` change and never decodes a video that hasn't played, so a scrubbed clip stays blank.
// load() starts the download; a muted play-then-pause (allowed without a tap for muted inline video) unlocks seeking.
export function primeVideo(v: HTMLVideoElement) {
  v.preload = "auto";
  v.load();
  v.play()?.then(() => v.pause()).catch(() => {});
}
