-- Only a persisted, complete reply consumes the allowance. No browser can finalize receipts.
create or replace function public.tjai_finish_reply(p_id uuid,p_user uuid,p_token uuid,p_conversation uuid,p_message text,p_reply text) returns jsonb language plpgsql security definer set search_path=public as $$
declare r public.tjai_reply_receipts; period text:=to_char(now() at time zone 'Europe/Istanbul','YYYY-MM-DD');
begin
 perform pg_advisory_xact_lock(hashtextextended(p_user::text,72));
 select * into r from tjai_reply_receipts where id=p_id and user_id=p_user for update;
 if not found then return jsonb_build_object('error','not_found'); end if;
 if r.status='succeeded' then return to_jsonb(r); end if;
 if r.status<>'reserved' or r.expires_at<now() or p_token is null or r.reservation_token is distinct from p_token then return jsonb_build_object('error','reservation_expired'); end if;
 if p_reply is null then
  update tjai_reply_receipts set status='failed' where id=p_id returning * into r;
 else
  if not tjai_lock_current_access(p_user,false) then
   update tjai_reply_receipts set status='failed' where id=p_id;
   return jsonb_build_object('error','access_revoked');
  end if;
  if length(p_reply)<1 or length(p_reply)>12000 then raise exception 'Invalid reply'; end if;
  if (select count(*) from tjai_reply_receipts where user_id=p_user and period_key=period and status='succeeded')>=r.allowance_limit then return jsonb_build_object('error','daily_limit'); end if;
  insert into tjai_chat_messages(user_id,conversation_id,role,content) values(p_user,p_conversation,'user',p_message),(p_user,p_conversation,'assistant',p_reply);
  update tjai_reply_receipts set status='succeeded',reply=p_reply,conversation_id=p_conversation::text,period_key=period where id=p_id returning * into r;
 end if;
 return to_jsonb(r);
end $$;
revoke all on function public.tjai_finish_reply(uuid,uuid,uuid,uuid,text,text) from public,anon,authenticated;
grant execute on function public.tjai_finish_reply(uuid,uuid,uuid,uuid,text,text) to service_role;
revoke all on function public.consume_tjai_credit(uuid,integer,text,jsonb),public.grant_tjai_credit(uuid,integer,text,jsonb) from public,anon,authenticated;
-- Generated results are server-owned. Existing rows stay readable by their owners.
do $$ declare pol record; begin
 for pol in select policyname from pg_policies where schemaname='public' and tablename='saved_tjai_plans' loop
  execute format('drop policy %I on public.saved_tjai_plans',pol.policyname);
 end loop;
end $$;
create policy tjai_saved_read_self on public.saved_tjai_plans for select using(auth.uid()=user_id);
