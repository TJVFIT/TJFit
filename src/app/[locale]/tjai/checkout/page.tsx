"use client";

import { useEffect, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import type { Locale } from '@/lib/i18n';
import { PUBLIC_COPY } from '@/lib/public-offers-copy';
import { openLemonCheckout } from '@/lib/payments/lemon/browser';
import { getTjaiFlowCopy } from '@/lib/tjai/flow-copy';
import { getTjaiCheckoutCopy } from '@/lib/tjai/checkout-copy';
import { CheckoutRecoveryError, emptyTjaiCheckout, isTjaiReceiptExpired, loadTjaiCheckout, mergeTjaiCheckout, parseCreatedTjaiOrder, tjaiCheckoutActions, tjaiCheckoutPath } from '@/lib/tjai/checkout-recovery';

export default function TjaiCheckout() {
  const params = useParams(), query = useSearchParams();
  const locale = (['en', 'tr', 'ar', 'es', 'fr'].includes(String(params.locale)) ? params.locale : 'en') as Locale;
  const intakeId = query.get('intake') ?? '';
  return <TjaiCheckoutFlow key={locale + ':' + intakeId} locale={locale} intakeId={intakeId} returnedOrderId={query.get('orderId')} />;
}

function TjaiCheckoutFlow({ locale, intakeId, returnedOrderId }: { locale: Locale; intakeId: string; returnedOrderId: string | null }) {
  const t = getTjaiFlowCopy(locale), copy = getTjaiCheckoutCopy(locale);
  const [orderId, setOrderId] = useState(returnedOrderId);
  const [state, setState] = useState(() => emptyTjaiCheckout(intakeId, returnedOrderId));
  const [busy, setBusy] = useState(false), [checking, setChecking] = useState(true), [refresh, setRefresh] = useState(0);
  const [actionError, setActionError] = useState(false);
  const orderRef = useRef(returnedOrderId), stateRef = useRef(state), busyRef = useRef(false), mounted = useRef(true);
  const epoch = useRef(0), loadSequence = useRef(0);
  stateRef.current = state;

  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  useEffect(() => {
    if (returnedOrderId === orderRef.current) return;
    epoch.current++; loadSequence.current++; orderRef.current = returnedOrderId;
    busyRef.current = false; setBusy(false); setActionError(false); setChecking(true);
    setOrderId(returnedOrderId); setState(emptyTjaiCheckout(intakeId, returnedOrderId));
  }, [returnedOrderId, intakeId]);

  useEffect(() => {
    let stopped = false, running = false;
    const check = async () => {
      if (running || busyRef.current) return;
      running = true; const sequence = ++loadSequence.current;
      const result = await loadTjaiCheckout(intakeId, orderId);
      if (!stopped && mounted.current && sequence === loadSequence.current && !busyRef.current) {
        setState(previous => mergeTjaiCheckout(previous, result)); setChecking(false);
      }
      running = false;
    };
    void check();
    const timer = setInterval(() => {
      const current = stateRef.current;
      if (orderId && (!current.receipt || current.receipt.status === 'pending' || (current.receipt.status === 'paid' && !current.hasAccess))) void check();
    }, 5000);
    return () => { stopped = true; clearInterval(timer); };
  }, [intakeId, orderId, refresh]);

  const actions = tjaiCheckoutActions(state, busy || checking);
  const retry = () => { if (busyRef.current) return; setActionError(false); setChecking(true); setRefresh(value => value + 1); };
  const rememberOrder = (id: string | null) => {
    orderRef.current = id; setOrderId(id);
    window.history.replaceState(window.history.state, '', tjaiCheckoutPath(locale, intakeId, id));
  };

  const checkout = async () => {
    if (busyRef.current || (!actions.canBuy && !actions.canResume)) return;
    busyRef.current = true; setBusy(true); setActionError(false); loadSequence.current++;
    const operation = ++epoch.current;
    const current = () => mounted.current && operation === epoch.current;
    try {
      let id = orderRef.current;
      if (!id) {
        const response = await fetch('/api/checkout/create-order', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ programSlug: 'tjai-pass', locale, intakeId }) });
        const value: unknown = await response.json();
        if (!current()) return;
        if (!response.ok) throw new CheckoutRecoveryError('unavailable');
        const receipt = parseCreatedTjaiOrder(value, intakeId, state.testMode);
        id = receipt.orderId;
        // Retain this intent before prepare/open: retry must not create another order.
        setState(previous => ({ ...previous, orderId: receipt.orderId, receipt, issue: null }));
        rememberOrder(id);
      }
      const response = await fetch('/api/checkout/prepare-session', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderId: id }) });
      const session = await response.json();
      if (!current()) return;
      if (!response.ok || typeof session?.url !== 'string' || session.testMode !== state.testMode) throw new CheckoutRecoveryError('unavailable');
      await openLemonCheckout(session.url);
    } catch {
      if (current()) setActionError(true);
    } finally {
      if (current()) { busyRef.current = false; setBusy(false); setChecking(true); setRefresh(value => value + 1); }
    }
  };

  const startNew = () => {
    if (!actions.canStartNew || busyRef.current) return;
    epoch.current++; loadSequence.current++; setActionError(false);
    rememberOrder(null); setState(previous => ({ ...previous, orderId: null, receipt: null }));
  };
  const receipt = state.receipt;
  const receiptText = receipt?.status === 'test_paid' ? copy.testPaid : receipt?.status === 'refunded' ? copy.refunded
    : receipt?.status === 'review' ? copy.review : receipt?.status === 'paid' ? (state.hasAccess ? t.paid : copy.paidAwaitingAccess)
    : receipt?.status === 'pending' ? (isTjaiReceiptExpired(receipt) ? copy.expired : copy.pending) : null;
  const error = state.issue === 'mismatch' ? copy.mismatch : state.issue || actionError ? copy.failed : null;
  const buttonClass = 'min-h-12 rounded-xl bg-accent px-5 py-3 disabled:opacity-40';

  return <main className="mx-auto min-h-[70vh] max-w-xl space-y-6 px-5 py-16">
    <p className="text-accent" dir="ltr">TJAI · $19.99</p><h1 className="text-3xl font-bold">{t.payment}</h1><p>{t.terms}</p>
    {(receipt?.testMode || (state.available && state.testMode)) && <p className="text-sm text-amber-200">{copy.testLabel}</p>}
    {receiptText && <p role="status" aria-live="polite">{receiptText}</p>}
    {checking && !receiptText && <p role="status">{copy.checking}</p>}
    {error && <p role="alert" className="text-amber-300">{error}</p>}
    {actions.canGenerate && <><p>{copy.existingAccess}</p><a className="inline-block rounded-xl bg-accent px-5 py-3" href={'/' + locale + '/ai?tab=my-plan&intake=' + encodeURIComponent(intakeId)}>{t.generate}</a></>}
    {!state.hasAccess && !orderId && <><p>{!checking && !state.available ? copy.unavailable : null}</p><button disabled={!actions.canBuy} aria-busy={busy} onClick={() => void checkout()} className={buttonClass}>{busy ? t.loading : t.buy}</button></>}
    {receipt?.status === 'pending' && !isTjaiReceiptExpired(receipt) && !state.hasAccess && <button disabled={!actions.canResume} aria-busy={busy} onClick={() => void checkout()} className={buttonClass}>{busy ? t.loading : copy.resumeCheckout}</button>}
    {actions.canStartNew && <button onClick={startNew} className="min-h-11 text-accent">{copy.startNew}</button>}
    {(orderId || error) && <button disabled={busy || checking} onClick={retry} className="block min-h-11 text-accent disabled:opacity-40">{orderId ? copy.checkStatus : t.retry}</button>}
    <a className="block min-h-11 py-3 text-accent" href={'/' + locale + '/ai?tab=my-plan&' + (state.ready ? 'intake=' + encodeURIComponent(intakeId) : 'start=1')}>{t.review}</a>
    {(error || receipt?.status === 'review') && <a className="block min-h-11 py-3 text-accent" href={'/' + locale + '/support'}>{PUBLIC_COPY[locale].support}</a>}
  </main>;
}
