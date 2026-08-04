-- Run once in the Supabase SQL Editor after pulling these UI changes.
-- Renames Shipped → Completed and removes Archived from the status enum.

alter table public.features alter column status drop default;

alter table public.features
  alter column status type text using status::text,
  alter column web_status type text using web_status::text,
  alter column app_status type text using app_status::text;

update public.features set status = 'Completed' where status in ('Shipped', 'Archived');
update public.features set web_status = 'Completed' where web_status in ('Shipped', 'Archived');
update public.features set app_status = 'Completed' where app_status in ('Shipped', 'Archived');

drop type public.feature_status;

create type public.feature_status as enum (
  'Idea', 'Planned', 'In Progress', 'Completed'
);

alter table public.features
  alter column status type public.feature_status using status::public.feature_status,
  alter column web_status type public.feature_status using nullif(web_status, '')::public.feature_status,
  alter column app_status type public.feature_status using nullif(app_status, '')::public.feature_status;

alter table public.features alter column status set default 'Idea';
