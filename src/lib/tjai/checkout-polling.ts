import {
  CheckoutRecoveryError, emptyTjaiCheckout, isTjaiReceiptExpired,
  loadTjaiCheckoutAccess, loadTjaiCheckoutAvailability, loadTjaiCheckoutReceipt,
  loadTjaiIntake, validTjaiCheckoutReferences,
  type TjaiCheckoutState, type TjaiReceipt,
} from './checkout-recovery';

type Options = {
  intakeId: string; orderId: string | null; visible: boolean;
  onState: (state: TjaiCheckoutState) => void; onChecking: (checking: boolean) => void;
  fetcher?: typeof fetch;
};

/** One checkout scope, in memory only. Receipt polls never reread saved answers. */
export function createTjaiCheckoutMonitor(options: Options) {
  const fetcher = options.fetcher ?? fetch;
  let state = emptyTjaiCheckout(options.intakeId, options.orderId);
  let accessReady = false, availabilityReady = false;
  let visible = options.visible, busy = false, stopped = true;
  let running = false, wakePending = false, revision = 0, failures = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let controller: AbortController | undefined;
  const publish = () => options.onState({ ...state });
  const clearTimer = () => { if (timer !== undefined) clearTimeout(timer); timer = undefined; };
  const terminal = () => state.issue === 'mismatch' || isTjaiReceiptExpired(state.receipt)
    || ['test_paid', 'refunded', 'review'].includes(state.receipt?.status ?? '')
    || (state.receipt?.status === 'paid' && state.hasAccess && state.issue === null);
  const runnable = () => !stopped && visible && !busy;
  const invalidate = () => { revision++; clearTimer(); controller?.abort(); };

  function schedule() {
    if (!runnable() || terminal() || (!state.orderId && !state.issue)) return;
    let delay = failures ? Math.min(60_000, 10_000 * 2 ** (failures - 1))
      : state.receipt?.status === 'paid' ? 15_000 : 5_000;
    if (state.receipt?.status === 'pending' && state.receipt.expiresAt) {
      delay = Math.min(delay, Math.max(0, Date.parse(state.receipt.expiresAt) - Date.now()));
    }
    timer = setTimeout(() => {
      timer = undefined;
      // Update the expired display without another database round trip.
      if (terminal()) { publish(); options.onChecking(false); return; }
      wake();
    }, delay);
  }

  function wake() {
    clearTimer();
    if (!runnable()) return;
    if (running) { wakePending = true; return; }
    void check();
  }

  async function check() {
    if (!validTjaiCheckoutReferences(state.intakeId, state.orderId)) {
      state = { ...state, issue: 'mismatch' }; publish(); options.onChecking(false); return;
    }
    running = true; wakePending = false;
    const version = revision, next = { ...state, issue: null } as TjaiCheckoutState;
    const abort = new AbortController(); controller = abort;
    const timeout = setTimeout(() => abort.abort(), 15_000);
    const current = () => version === revision && runnable();
    const accessNeeded = !accessReady || (state.receipt?.status === 'paid' && !state.hasAccess);
    let nextAccessReady = accessReady, nextAvailabilityReady = availabilityReady;
    const rejected = (error: unknown) => {
      if (error instanceof CheckoutRecoveryError && error.issue === 'mismatch') next.issue = 'mismatch';
      else if (!next.issue) next.issue = 'unavailable';
    };
    const readAccess = async () => {
      try { next.hasAccess = await loadTjaiCheckoutAccess(fetcher, abort.signal); nextAccessReady = true; }
      catch (error) { nextAccessReady = false; rejected(error); }
    };
    try {
      await Promise.all([
        !next.ready ? loadTjaiIntake(next.intakeId, fetcher, abort.signal).then(() => { next.ready = true; }).catch(rejected) : undefined,
        accessNeeded ? readAccess() : undefined,
        !availabilityReady ? loadTjaiCheckoutAvailability(fetcher, abort.signal)
          .then(value => { Object.assign(next, value); nextAvailabilityReady = true; })
          .catch(error => { nextAvailabilityReady = false; rejected(error); }) : undefined,
        next.orderId ? loadTjaiCheckoutReceipt(next.intakeId, next.orderId, fetcher, abort.signal)
          .then(receipt => { next.receipt = receipt; }).catch(rejected) : undefined,
      ]);
      if (!current()) return;
      // A webhook may have changed entitlement since the preceding pending poll.
      if (!accessNeeded && next.receipt?.status !== state.receipt?.status) await readAccess();
      if (!current()) return;
      if (abort.signal.aborted && !next.issue) next.issue = 'unavailable';
      if (next.issue === 'mismatch') next.receipt = null;
      state = next; accessReady = nextAccessReady; availabilityReady = nextAvailabilityReady;
      failures = next.issue === 'unavailable' ? failures + 1 : 0;
      publish(); options.onChecking(false);
    } finally {
      clearTimeout(timeout);
      if (controller === abort) controller = undefined;
      running = false;
      // An aborted fetch may settle late. Its successor waits instead of overlapping.
      if (wakePending && runnable()) wake();
      else if (current()) schedule();
    }
  }

  return {
    start() { if (!stopped) return; stopped = false; options.onChecking(true); wake(); },
    stop() { stopped = true; wakePending = false; invalidate(); },
    setVisible(value: boolean) {
      if (visible === value) return;
      visible = value;
      if (!value) { wakePending = false; invalidate(); }
      else if (!terminal()) { options.onChecking(true); wake(); }
      else { publish(); options.onChecking(false); }
    },
    setBusy(value: boolean) {
      if (busy === value) return;
      busy = value;
      if (value) { wakePending = false; invalidate(); }
      else { accessReady = false; availabilityReady = false; options.onChecking(true); wake(); }
    },
    refresh() {
      accessReady = false; availabilityReady = false;
      options.onChecking(true);
      // Explicit checks also work for terminal receipts. Only one may be in flight.
      invalidate(); wake();
    },
    setOrder(orderId: string | null, receipt?: TjaiReceipt) {
      if (orderId === state.orderId) return;
      invalidate(); failures = 0; accessReady = false; availabilityReady = false;
      const bound = receipt?.orderId === orderId && receipt?.intakeId === state.intakeId;
      state = { ...state, orderId, receipt: bound ? receipt! : null, issue: null };
      publish(); options.onChecking(true); wake();
    },
  };
}

export type TjaiCheckoutMonitor = ReturnType<typeof createTjaiCheckoutMonitor>;
