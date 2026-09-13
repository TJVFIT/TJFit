/** A delayed option selection must never advance after another navigation. */
export function createQuizAutoAdvance() {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let revision = 0;
  const cancel = () => {
    revision += 1;
    if (timer !== undefined) clearTimeout(timer);
    timer = undefined;
  };
  return {
    cancel,
    schedule(advance: () => void, delay: number) {
      cancel();
      const scheduledRevision = revision;
      timer = setTimeout(() => {
        if (revision !== scheduledRevision) return;
        timer = undefined;
        advance();
      }, delay);
    }
  };
}
