-- Canonical stored provider for Paddle Billing is `paddle`. `live` was a short-lived alias from the generic gateway adapter.
update program_orders set provider = 'paddle' where provider = 'live';
