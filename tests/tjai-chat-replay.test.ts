import {beforeEach,describe,expect,it,vi} from 'vitest';
import {NextRequest} from 'next/server';
import {createChatRetryController,deliverChatAttempt} from '@/lib/tjai/chat-delivery';

const mocks=vi.hoisted(()=>({receipt:null as null|{status:string;reply:string;conversation_id:string},rpc:vi.fn(),access:vi.fn(),provider:vi.fn()}));
vi.mock('@/lib/require-auth',()=>({requireAuth:async()=>({ok:true,user:{id:'owner'},supabase:{}})}));
vi.mock('@/lib/supabase-server',()=>({getSupabaseServerClient:()=>({rpc:mocks.rpc,from:()=>({select(){return this;},eq(){return this;},maybeSingle:async()=>({error:null,data:mocks.receipt})})})}));
vi.mock('@/lib/tjai/server-access',()=>({getTjaiServerAccess:mocks.access}));
vi.mock('@/lib/tjai/free-provider',()=>({callFreeGroq:mocks.provider,TjaiProviderError:class extends Error{code='test';}}));
vi.mock('@/lib/rate-limit',()=>({rateLimit:async()=>({success:true})}));
import {POST} from '@/app/api/tjai/chat/route';

beforeEach(()=>{vi.clearAllMocks();mocks.receipt=null;});
describe('lost reply acknowledgement replay',()=>{
 it('retries the same committed receipt without provider or allowance writes even after the fifth reply',async()=>{
  const retries=createChatRetryController(()=>crypto.randomUUID());
  const payload={message:'What should I do next?',conversationId:crypto.randomUUID(),locale:'en'};
  const request=retries.begin(payload);let committedReplies=4,first=true;
  const fetcher:typeof fetch=async(_url,init)=>{
   const body=JSON.parse(String(init?.body));expect(body.requestId).toBe(request.requestId);
   if(first){first=false;committedReplies++;mocks.receipt={status:'succeeded',reply:'Your saved fifth reply',conversation_id:payload.conversationId};throw new TypeError('HTTP acknowledgement lost');}
   return POST(new NextRequest('https://preview.example/api/tjai/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:String(init?.body)}));
  };
  await expect(deliverChatAttempt(request,undefined,fetcher)).rejects.toThrow('HTTP acknowledgement lost');
  expect(retries.matches(payload)).toBe(true);
  // Clicking the current history item must not retire the ambiguous fifth send.
  if(!retries.preservePendingConversation(payload.conversationId,payload.conversationId))retries.newIntent();
  const replay=retries.begin(payload);expect(replay.requestId).toBe(request.requestId);
  expect(await deliverChatAttempt(replay,undefined,fetcher)).toBe('Your saved fifth reply');
  retries.acknowledge(replay.requestId);
  expect(committedReplies).toBe(5);expect(mocks.rpc).not.toHaveBeenCalled();expect(mocks.provider).not.toHaveBeenCalled();expect(mocks.access).not.toHaveBeenCalled();
  expect(retries.matches(payload)).toBe(false);
 });
});
