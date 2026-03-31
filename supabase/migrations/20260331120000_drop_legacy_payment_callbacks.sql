-- Remove legacy callback store; normalize old provider values for the live-gateway adapter.
update program_orders set provider = 'live' where provider = 'paytr';
drop table if exists paytr_callbacks;
