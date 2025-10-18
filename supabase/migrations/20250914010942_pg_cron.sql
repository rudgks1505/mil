CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

--SELECT cron.schedule(
--  'job_name', -- 작업 이름 (고유해야 함) 이미 존재할 경우 덮어씀
--  'schedule', -- 실행 주기 (Cron 표현식) //supabase 클라우드, 로컬 도커, utc기준
--  'command'   -- 실행할 SQL 쿼리
--);

create or replace function schedule_job(job_name text, schedule text, command text)
returns bigint
language sql
as $$
  select cron.schedule(job_name, schedule, command);
$$;

create or replace function unschedule_job(job_name text)
returns boolean
language sql
as $$
  select cron.unschedule(job_name);
$$;

select schedule_job( 
  'daily-log-cleanup',
  '30 3 * * *',
  'UPDATE books SET uuid = NULL WHERE uuid IS NOT NULL'
);