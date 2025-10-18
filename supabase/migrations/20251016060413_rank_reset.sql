select cron.unschedule('book_rank_schedule');

select cron.schedule(
  'book_rank_schedule',
  '0 15 * * *',
  $$
    select net.http_post(
      url := (select decrypted_secret from vault.decrypted_secrets where name = 'project_url')
             || '/functions/v1/book_rank',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'cron_call_secret')
      ),
      body := '{}'::jsonb
    )
  $$
);