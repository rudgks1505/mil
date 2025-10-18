select cron.unschedule('cleanup-member-uuid');


--sql로 바로 uuid null만들경우 member 정책에 막히기에, 우회하여야함. 엣지함수에 쿼리빌더, 롤키로 실행시킴.
--pgcron cli로 실행시킬경우, 슈퍼유저이기에 작동하나, 배포 후에는 작동안함. 그러기에 cron테이블에 업로드시켜 작동해야함.
--엣지 함수 접근 전에 api키를 헤더에 안넣을 경우 권한에러 남. 마이그레이션에 롤키 넣지말고, sql에디터에 vault로 키값 넣기.
select cron.schedule(
  'member_uuid_cleanup_schedule',
  '*/10 * * * *',
  $$
    select net.http_post(
      url := (select decrypted_secret from vault.decrypted_secrets where name = 'project_url')
             || '/functions/v1/member_uuid_cleanup',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'cron_call_secret')
      ),
      body := '{}'::jsonb
    )
  $$
);