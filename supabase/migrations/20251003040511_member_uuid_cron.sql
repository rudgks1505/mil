create extension if not exists supabase_vault;
create extension if not exists pg_net;
create extension if not exists pg_cron with schema cron;

select cron.schedule(
  'cleanup-member-uuid',
  '*/10 * * * *',
  $$
    select net.http_post(
      url := (select decrypted_secret from vault.decrypted_secrets where name = 'project_url')
             || '/functions/v1/cleanup-member-uuid',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        -- 엣지 함수에서 CRON_CALL_SECRET를 검증하도록 설계
        'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'cron_call_secret')
      ),
      body := '{}'
    );
  $$
);