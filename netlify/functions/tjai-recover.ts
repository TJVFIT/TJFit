import { dispatchTjaiWorker } from '../../src/lib/tjai/worker-dispatch';

/** Native scheduled functions cannot be invoked through their public URL. */
export default async function recover(): Promise<void> {
  await dispatchTjaiWorker();
}

export const config = { schedule: '*/5 * * * *' };
