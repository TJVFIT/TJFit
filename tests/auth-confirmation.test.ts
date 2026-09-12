import {NextRequest} from 'next/server';
import {afterEach,beforeEach,describe,expect,it,vi} from 'vitest';
import {authConfirmationNext,authConfirmationUrl,getAuthConfirmationCopy} from '@/lib/auth-confirmation';
import type {Locale} from '@/lib/i18n';
const mocks=vi.hoisted(()=>({factory:vi.fn(),exchange:vi.fn(),setCookie:vi.fn()}));
vi.mock('@supabase/ssr',()=>({createServerClient:mocks.factory}));
vi.mock('next/headers',()=>({cookies:async()=>({getAll:()=>[{name:'pkce-verifier',value:'synthetic-verifier'}],set:mocks.setCookie})}));
import {GET} from '@/app/[locale]/auth/callback/route';
const locales:Locale[]=['en','tr','ar','es','fr'];
beforeEach(()=>{
 vi.stubEnv('NEXT_PUBLIC_SITE_URL','https://tjfit.org');
 vi.clearAllMocks();vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL','https://example.supabase.co');vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY','synthetic-anon');
 mocks.exchange.mockResolvedValue({data:{user:{id:'user-a'},session:{access_token:'synthetic-token'}},error:null});
 mocks.factory.mockImplementation((_url,_key,options)=>({auth:{exchangeCodeForSession:async(code:string)=>{
  expect(options.cookies.getAll()).toEqual([{name:'pkce-verifier',value:'synthetic-verifier'}]);
  const result=await mocks.exchange(code);
  if(result.data?.session)options.cookies.setAll([{name:'session',value:'synthetic-session',options:{secure:true,sameSite:'lax',path:'/',maxAge:3600}}]);
  return result;
 }}}));
});
afterEach(()=>vi.unstubAllEnvs());
describe('email confirmation callback',()=>{
 it.each(['','?code=one-time-code'])('keeps callback cookies on the configured preview alias %s',async(query)=>{
  vi.stubEnv('NEXT_PUBLIC_SITE_URL','https://tonight--tjfit.netlify.app');
  const response=await GET(new NextRequest('https://immutable-deploy--tjfit.netlify.app/en/auth/callback'+query,{headers:{'x-forwarded-host':'evil.example'}}),{params:Promise.resolve({locale:'en'})});
  expect(new URL(response.headers.get('location')!).origin).toBe('https://tonight--tjfit.netlify.app');
 });
 it('fails closed before exchanging a code when callback origin configuration is invalid',async()=>{
  vi.stubEnv('NEXT_PUBLIC_SITE_URL','https://user:password@wrong.example');
  const response=await GET(new NextRequest('https://tjfit.org/en/auth/callback?code=one-time-code'),{params:Promise.resolve({locale:'en'})});
  expect(response.status).toBe(503);expect(mocks.exchange).not.toHaveBeenCalled();
 });
 it.each(locales)('exchanges %s PKCE code using cookie storage before resuming the full return path',async(locale)=>{
  const next=`/${locale}/ai?tab=my-plan&start=1&resume=1&intake=draft-id`;
  const response=await GET(new NextRequest(`https://tjfit.org/${locale}/auth/callback?code=one-time-code&next=${encodeURIComponent(next)}`),{params:Promise.resolve({locale})});
  expect(mocks.exchange).toHaveBeenCalledExactlyOnceWith('one-time-code');expect(mocks.setCookie).toHaveBeenCalledWith('session','synthetic-session',{secure:true,sameSite:'lax',path:'/',maxAge:3600});
  expect(response.status).toBe(303);expect(response.headers.get('location')).toBe('https://tjfit.org'+next);
  expect(response.headers.get('Cache-Control')).toBe('private, no-store, max-age=0');expect(response.headers.get('Referrer-Policy')).toBe('no-referrer');
  expect(response.headers.get('location')).not.toContain('one-time-code');
 });
 it.each(['','?code=a&code=b','?code=a&error=access_denied','?code=%20','?token_hash=unsupported&type=email'])('does not exchange missing, ambiguous or provider-rejected codes: %s',async(query)=>{
  const response=await GET(new NextRequest('https://tjfit.org/en/auth/callback'+query),{params:Promise.resolve({locale:'en'})});
  expect(mocks.factory).not.toHaveBeenCalled();const location=new URL(response.headers.get('location')!);
  expect(location.pathname).toBe('/en/verify-email');expect(location.searchParams.get('authError')).toBe('confirmation_failed');expect(location.searchParams.get('redirect')).toBe('/en/dashboard');expect(location.searchParams.has('code')).toBe(false);
 });
 it.each(['error','no-session','throws'])('fails closed and preserves safe retry target when exchange %s',async(kind)=>{
  if(kind==='throws')mocks.exchange.mockRejectedValue(new Error('synthetic-provider-error'));
  else mocks.exchange.mockResolvedValue({data:{user:null,session:null},error:kind==='error'?{message:'synthetic-error'}:null});
  const next='/en/ai?tab=my-plan&start=1&resume=1';
  const response=await GET(new NextRequest('https://tjfit.org/en/auth/callback?code=one-time-code&next='+encodeURIComponent(next)),{params:Promise.resolve({locale:'en'})});
  const location=new URL(response.headers.get('location')!);expect(location.pathname).toBe('/en/verify-email');expect(location.searchParams.get('redirect')).toBe(next);expect(mocks.setCookie).not.toHaveBeenCalled();
 });
 it.each(['https://evil.example','//evil.example','/fr/dashboard','/en/../../api/secret','/en/..%2fapi/secret','/en/auth/callback?code=again','/en/auth/%63allback'])('uses the locale dashboard for unsafe or recursive next %s',async(next)=>{
  expect(authConfirmationNext('en',next)).toBe('/en/dashboard');
  const response=await GET(new NextRequest('https://tjfit.org/en/auth/callback?code=one-time-code&next='+encodeURIComponent(next)),{params:Promise.resolve({locale:'en'})});
  expect(response.headers.get('location')).toBe('https://tjfit.org/en/dashboard');
 });
 it.each(locales)('builds a matching signup/resend callback and localized original-tab instructions in %s',(locale)=>{
  const next=`/${locale}/ai?tab=my-plan&start=1&resume=1`;
  const url=new URL(authConfirmationUrl('https://tjfit.org',locale,next));expect(url.pathname).toBe(`/${locale}/auth/callback`);expect(url.searchParams.get('next')).toBe(next);expect(getAuthConfirmationCopy(locale).assessment.length).toBeGreaterThan(70);
 });
});
