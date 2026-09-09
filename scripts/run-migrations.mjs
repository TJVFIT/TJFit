console.error(
  'This legacy migration runner is disabled because it replays ad-hoc SQL that can undo later security policies. ' +
  'Use the reviewed timestamped files in supabase/migrations through the canonical Supabase migration workflow. ' +
  'Verify the target project and migration history before applying changes; this command has not read credentials or connected to a database.'
);
process.exit(1);
