"use client";

import { useEffect, useMemo, useSyncExternalStore } from 'react';
import type { Locale } from '@/lib/i18n';
import { openLemonCheckout } from '@/lib/payments/lemon/browser';
import { bundleCheckoutActions, bundleCheckoutPath, createBundleCheckoutRecovery, isBundleReceiptExpired } from './bundle-recovery';
import { getDigitalCheckoutCopy } from './checkout-copy';

/** Undefined reference restores the current product's URL; null deliberately starts without one. */
export function useBundleCheckout(locale: Locale, slug: string, returnedOrderId?: string | null) {
  const recovery = useMemo(() => createBundleCheckoutRecovery(locale, slug, {
    openCheckout: openLemonCheckout,
    rememberOrder: orderId => {
      const url = new URL(window.location.href);
      url.searchParams.set('program', slug);
      if (orderId) url.searchParams.set('orderId', orderId); else url.searchParams.delete('orderId');
      window.history.replaceState(window.history.state, '', url.pathname + url.search + url.hash);
    },
    onUnauthorized: () => {
      const query = new URLSearchParams(window.location.search);
      const path = bundleCheckoutPath(locale, slug, query.get('program') === slug ? query.get('orderId') : null);
      window.location.href = '/' + locale + '/login?redirect=' + encodeURIComponent(path);
    }
  }), [locale, slug]);
  const state = useSyncExternalStore(recovery.subscribe, recovery.getSnapshot, recovery.getSnapshot);
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const id = returnedOrderId === undefined ? (query.get('program') === slug ? query.get('orderId') : null) : returnedOrderId;
    void recovery.initialize(id);
    return recovery.cancel;
  }, [recovery, slug, returnedOrderId]);
  const copy = getDigitalCheckoutCopy(locale), receipt = state.receipt;
  const status = receipt?.status === 'paid' ? copy.paid : receipt?.status === 'test_paid' ? copy.test
    : receipt?.status === 'refunded' ? copy.refunded : receipt?.status === 'review' ? copy.review
    : receipt?.status === 'pending' ? (isBundleReceiptExpired(receipt) ? copy.expired : copy.pending) : null;
  const error = state.issue === 'mismatch' ? copy.mismatch : state.issue === 'unbound' ? copy.unbound : state.issue || state.actionError ? copy.failed : null;
  return { recovery, state, actions: bundleCheckoutActions(state), status, error, copy };
}
