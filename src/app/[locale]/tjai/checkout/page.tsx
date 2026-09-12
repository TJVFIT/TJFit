"use client";
import {useEffect,useState} from 'react';
import {useParams,useSearchParams} from 'next/navigation';
import type {Locale} from '@/lib/i18n';
import {openLemonCheckout} from '@/lib/payments/lemon/browser';
import {getTjaiFlowCopy} from '@/lib/tjai/flow-copy';
export default function TjaiCheckout(){
 const params=useParams(),query=useSearchParams(),locale=(['en','tr','ar','es','fr'].includes(String(params.locale))?params.locale:'en') as Locale,t=getTjaiFlowCopy(locale);
 const intakeId=query.get('intake');const [ready,setReady]=useState(false),[paid,setPaid]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState('');
 useEffect(()=>{let stopped=false;const check=async()=>{try{
   const [draft,access]=await Promise.all([fetch('/api/tjai/intake?id='+encodeURIComponent(intakeId??'')),fetch('/api/tjai/access',{cache:'no-store'})]);
   if(!draft.ok||!access.ok)throw new Error('unavailable');const d=await draft.json(),a=await access.json();
   if(!stopped){setReady(Boolean(intakeId&&d.intake?.id===intakeId));setPaid(Boolean(a.hasPass||a.hasLegacyAccess));}
  }catch{if(!stopped)setError(t.error);}};void check();const timer=setInterval(()=>void check(),5000);return()=>{stopped=true;clearInterval(timer);};},[intakeId,t.error]);
 const checkout=async()=>{setBusy(true);setError('');try{
  const order=await fetch('/api/checkout/create-order',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({programSlug:'tjai-pass',locale,intakeId})});
  const o=await order.json();if(!order.ok)throw new Error('order');
  const session=await fetch('/api/checkout/prepare-session',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({orderId:o.order.id})});
  const s=await session.json();if(!session.ok||!s.url)throw new Error('checkout');await openLemonCheckout(s.url);setBusy(false);
 }catch{setError(t.error);setBusy(false);}};
 return <main className="mx-auto min-h-[70vh] max-w-xl space-y-6 px-5 py-16"><p className="text-accent">TJAI · $19.99</p><h1 className="text-3xl font-bold">{t.payment}</h1><p>{t.terms}</p>{error&&<p role="alert" className="text-amber-300">{error}</p>}{paid?<><p>{t.paid}</p><a className="inline-block rounded-xl bg-accent px-5 py-3" href={'/'+locale+'/ai?tab=my-plan&intake='+intakeId}>{t.generate}</a></>:<><p>{t.pending}</p><button disabled={!ready||busy} onClick={()=>void checkout()} className="rounded-xl bg-accent px-5 py-3 disabled:opacity-40">{busy?t.loading:t.buy}</button></>}<a className="block text-accent" href={'/'+locale+'/ai?tab=my-plan&start=1'}>{t.review}</a></main>;
}
