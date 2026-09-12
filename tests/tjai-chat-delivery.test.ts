import {describe,expect,it,vi} from 'vitest';
import {readFileSync} from 'node:fs';
import {ChatDeliveryError,createChatRetryController,deliverChatAttempt,loadChatMessages,restoreUnsentChatInput,type DeliveredChatMessage} from '@/lib/tjai/chat-delivery';

const payload={message:'  Help with my next workout  ',conversationId:'conversation-a',locale:'en'};
const reply=(message='A practical answer')=>new Response(JSON.stringify({message,conversationId:payload.conversationId}),{headers:{'Content-Type':'application/json'}});

describe('chat send identity and recovery',()=>{
 it('reuses a request identity only for the same trimmed message, conversation and locale',()=>{
  const makeId=vi.fn().mockReturnValueOnce('one').mockReturnValueOnce('two').mockReturnValueOnce('three').mockReturnValueOnce('four');
  const retries=createChatRetryController(makeId),first=retries.begin(payload);
  expect(first.message).toBe(payload.message.trim());expect(retries.begin({...payload,message:payload.message.trim()})).toBe(first);
  expect(retries.begin({...payload,message:'Different request'}).requestId).toBe('two');
  expect(retries.begin({...payload,conversationId:'conversation-b'}).requestId).toBe('three');
  expect(retries.begin({...payload,locale:'ar'}).requestId).toBe('four');
 });
 it('clears only the acknowledged request or an explicit new intent',()=>{
  const retries=createChatRetryController(()=>crypto.randomUUID()),attempt=retries.begin(payload);
  retries.acknowledge('another-request');expect(retries.matches(payload)).toBe(true);
  retries.acknowledge(attempt.requestId);expect(retries.matches(payload)).toBe(false);
  expect(retries.begin(payload).requestId).not.toBe(attempt.requestId);
  retries.newIntent();expect(retries.matches(payload)).toBe(false);
 });
 it('keeps a pending send when selecting the active conversation but permits a different conversation',()=>{
  const retries=createChatRetryController(()=>crypto.randomUUID()),attempt=retries.begin(payload);
  expect(retries.preservePendingConversation(payload.conversationId,payload.conversationId)).toBe(true);
  expect(retries.begin(payload).requestId).toBe(attempt.requestId);
  expect(retries.preservePendingConversation(payload.conversationId,'another-conversation')).toBe(false);
  retries.acknowledge(attempt.requestId);
  expect(retries.preservePendingConversation(payload.conversationId,payload.conversationId)).toBe(false);
 });
 it.each([402,429,503])('keeps the same request and restores editable text after HTTP %s',async(status)=>{
  const retries=createChatRetryController(()=>crypto.randomUUID()),attempt=retries.begin(payload);
  await expect(deliverChatAttempt(attempt,undefined,vi.fn().mockResolvedValue(new Response('{}',{status})))).rejects.toMatchObject({status});
  expect(restoreUnsentChatInput('',attempt.message)).toBe(attempt.message);
  expect(retries.begin(payload)).toBe(attempt);
 });
 it.each([new TypeError('network unavailable'),Object.assign(new Error('timeout'),{name:'AbortError'})])('preserves retries after a transport failure',async(error)=>{
  const retries=createChatRetryController(()=>crypto.randomUUID()),attempt=retries.begin(payload);
  await expect(deliverChatAttempt(attempt,undefined,vi.fn().mockRejectedValue(error))).rejects.toBe(error);
  expect(retries.matches(payload)).toBe(true);expect(retries.begin(payload)).toBe(attempt);
 });
 it('does not overwrite a newer composer draft when an older request fails',()=>{
  expect(restoreUnsentChatInput('My next question','Failed question')).toBe('My next question');
  expect(restoreUnsentChatInput('','Failed question')).toBe('Failed question');
 });
 it('accepts a complete matching JSON acknowledgement',async()=>{
  const attempt=createChatRetryController(()=>crypto.randomUUID()).begin(payload),fetcher=vi.fn().mockResolvedValue(reply());
  expect(await deliverChatAttempt(attempt,undefined,fetcher)).toBe('A practical answer');
  expect(JSON.parse(fetcher.mock.calls[0][1].body)).toEqual(attempt);
 });
 it.each([{message:''},{message:'answer',conversationId:'wrong'},{message:'answer',conversationId:payload.conversationId,requestId:'wrong'},null])('rejects ambiguous success payload %j without retiring the pending send',async(data)=>{
  const retries=createChatRetryController(()=>crypto.randomUUID()),attempt=retries.begin(payload);
  await expect(deliverChatAttempt(attempt,undefined,vi.fn().mockResolvedValue(new Response(JSON.stringify(data))))).rejects.toBeInstanceOf(ChatDeliveryError);
  expect(retries.matches(payload)).toBe(true);
 });
});

describe('conversation loading preserves displayed history until success',()=>{
 it.each([402,503])('does not replace history on HTTP %s',async(status)=>{
  const original:DeliveredChatMessage[]=[{id:'saved',role:'user',content:'Already saved'}];let visible=original;
  await expect(loadChatMessages('one',vi.fn().mockResolvedValue(new Response('{}',{status}))).then(rows=>{visible=rows;})).rejects.toMatchObject({status});
  expect(visible).toBe(original);
 });
 it('does not replace history on a network outage',async()=>{
  const original:DeliveredChatMessage[]=[{id:'saved',role:'user',content:'Already saved'}];let visible=original;
  await expect(loadChatMessages('one',vi.fn().mockRejectedValue(new TypeError('offline'))).then(rows=>{visible=rows;})).rejects.toThrow();expect(visible).toBe(original);
 });
 it.each([{},null,{messages:[{id:'one',role:'system',content:'bad role'}]},{messages:[{id:'one',role:'user',content:null}]}])('rejects malformed successful history %j',async(data)=>{
  await expect(loadChatMessages('one',vi.fn().mockResolvedValue(new Response(JSON.stringify(data))))).rejects.toBeInstanceOf(ChatDeliveryError);
 });
 it('accepts a real empty conversation or complete saved messages',async()=>{
  expect(await loadChatMessages('one',vi.fn().mockResolvedValue(new Response('{"messages":[]}')))).toEqual([]);
  const rows=[{id:'one',role:'assistant',content:'Saved answer',created_at:'2026-09-13T00:00:00Z'}];
  expect(await loadChatMessages('one',vi.fn().mockResolvedValue(new Response(JSON.stringify({messages:rows}))))).toEqual(rows);
 });
});

it('connects recovery to the client before allowance gating and prevents concurrent navigation',()=>{
 const source=readFileSync('src/components/tjai/tjai-chat-standalone.tsx','utf8');
 expect(source).toContain('!access.canUseChat && !retryController.matches(payload)');
 expect(source).toContain('const attempt = retryController.begin(payload)');
 expect(source).toContain('setInput(current => restoreUnsentChatInput(current, attempt.message))');
 expect(source).toContain('retryController.acknowledge(attempt.requestId)');
 expect(source).toContain('const rows = await loadChatMessages(id)');
 expect(source).toContain('if (retryController.preservePendingConversation(conversationId, id)) return');
 expect(source).toContain('setFailedConversation(id)');
 expect(source).toContain('if (!message.trim() || operationRef.current) return');
 expect(source.match(/if \(operationRef\.current\) return/g)).toHaveLength(2);
});
