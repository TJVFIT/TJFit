import {NextResponse,type NextRequest} from 'next/server';
import {requireLocaleParam} from '@/lib/require-locale';
import {createServerSupabaseClient} from '@/lib/supabase/server';
import {authConfirmationNext} from '@/lib/auth-confirmation';

export const dynamic='force-dynamic';
export async function GET(request:NextRequest,context:{params:Promise<{locale:string}>}) {
 const locale=requireLocaleParam((await context.params).locale);
 const incoming=new URL(request.url),next=authConfirmationNext(locale,incoming.searchParams.get('next'));
 // Netlify can expose its immutable deploy origin in request.url. Keep the
 // browser on the configured alias so the original PKCE/session cookies apply.
 let origin:string;
 try {
  const configured=new URL(process.env.NEXT_PUBLIC_SITE_URL?.trim() || incoming.origin);
  if(configured.username||configured.password||(configured.protocol!=='https:'&&!(configured.protocol==='http:'&&['localhost','127.0.0.1'].includes(configured.hostname))))throw new Error('Invalid callback origin');
  origin=configured.origin;
 } catch { return NextResponse.json({error:'Authentication temporarily unavailable'},{status:503,headers:{'Cache-Control':'no-store'}}); }
 const destination=new URL(`/${locale}/verify-email`,origin);
 destination.searchParams.set('authError','confirmation_failed');
 destination.searchParams.set('redirect',next);
 const code=incoming.searchParams.get('code');
 if(code&&code.length<=4096&&!/\s/.test(code)&&incoming.searchParams.getAll('code').length===1&&!incoming.searchParams.has('error')) {
  try {
   const supabase=await createServerSupabaseClient();
   // The SSR client reads the original browser's PKCE verifier cookie and
   // writes the resulting session cookies in this route handler response.
   const {data,error}=await supabase.auth.exchangeCodeForSession(code);
   if(!error&&data.session&&data.user) {
    const response=NextResponse.redirect(new URL(next,origin),303);
    response.headers.set('Cache-Control','private, no-store, max-age=0');
    response.headers.set('Referrer-Policy','no-referrer');
    return response;
   }
  } catch { /* Never log confirmation codes, session tokens or provider errors. */ }
 }
 const response=NextResponse.redirect(destination,303);
 response.headers.set('Cache-Control','private, no-store, max-age=0');
 response.headers.set('Referrer-Policy','no-referrer');
 return response;
}
