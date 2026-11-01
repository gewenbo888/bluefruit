-- One free Supabase project can serve both apps. Run once in the SQL editor.
-- Auth email link delivery must be configured before PLATFORM_LOGIN_READY=true.
begin;
create table if not exists public.psy_projects (
 user_id uuid not null references auth.users(id) on delete cascade,
 kind text not null check(kind in ('blue','money')),
 id uuid not null,
 title text not null check(length(title)<=200),
 path text not null,
 size bigint not null check(size between 1 and 52428800),
 updated_at timestamptz not null default now(),
 archived boolean not null default false,
 primary key(user_id,kind,id)
);
alter table public.psy_projects enable row level security;
create policy projects_read_own on public.psy_projects for select to authenticated using((select auth.uid())=user_id);
-- Writes are validated in the site server; never grant client mutation access.
create table if not exists public.psy_submissions (
 id uuid primary key,
 user_id uuid not null references auth.users(id) on delete cascade,
 project_id uuid not null,
 title text not null check(length(title)<=150),
 description text not null check(length(description)<=1200),
 creator_name text not null check(length(creator_name)<=80),
 language text not null default 'zh-CN',
 asset_path text not null,
 mime text not null,
 size bigint not null check(size between 1 and 52428800),
 status text not null default 'pending' check(status in ('pending','approved','rejected','withdrawn')),
 review_note text not null default '',
 created_at timestamptz not null default now(),
 reviewed_at timestamptz
);
alter table public.psy_submissions enable row level security;
create policy submissions_read_own on public.psy_submissions for select to authenticated using((select auth.uid())=user_id);
create table if not exists public.psy_publications (
 id uuid primary key references public.psy_submissions(id),
 title text not null,
 description text not null,
 creator_name text not null,
 video_url text not null,
 visible boolean not null default true,
 created_at timestamptz not null default now()
);
alter table public.psy_publications enable row level security;
create policy publications_read_visible on public.psy_publications for select to anon,authenticated using(visible=true);
create table if not exists public.psy_generation_usage (
 user_id uuid not null references auth.users(id) on delete cascade,
 usage_day date not null,
 requests integer not null default 0 check(requests>=0),
 primary key(user_id,usage_day)
);
alter table public.psy_generation_usage enable row level security;
create table if not exists public.psy_generation_budget (
 usage_day date primary key,
 requests integer not null default 0 check(requests>=0)
);
alter table public.psy_generation_budget enable row level security;
create or replace function public.psy_reserve_generation(target_user uuid,max_daily integer default 5)
returns boolean language plpgsql security definer set search_path=public as $$
declare used integer; total_used integer;
begin
 if max_daily<1 or max_daily>20 then return false; end if;
 insert into public.psy_generation_usage(user_id,usage_day,requests)
 values(target_user,(now() at time zone 'UTC')::date,1)
 on conflict(user_id,usage_day) do update set requests=psy_generation_usage.requests+1
 where psy_generation_usage.requests<max_daily
 returning requests into used;
 if used is null then return false; end if;
 insert into public.psy_generation_budget(usage_day,requests)
 values((now() at time zone 'UTC')::date,1)
 on conflict(usage_day) do update set requests=psy_generation_budget.requests+1
 where psy_generation_budget.requests<100
 returning requests into total_used;
 return total_used is not null;
end; $$;
revoke all on function public.psy_reserve_generation(uuid,integer) from public,anon,authenticated;
grant execute on function public.psy_reserve_generation(uuid,integer) to service_role;
grant select on public.psy_projects,public.psy_submissions to authenticated;
grant select on public.psy_publications to anon,authenticated;
revoke insert,update,delete on public.psy_projects,public.psy_submissions,public.psy_publications,public.psy_generation_usage,public.psy_generation_budget from anon,authenticated;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values
 ('psy-projects','psy-projects',false,52428800,array['application/zip']),
 ('psy-submissions','psy-submissions',false,52428800,array['video/mp4','video/webm']),
 ('psy-public','psy-public',true,52428800,array['video/mp4','video/webm'])
on conflict(id) do nothing;
create policy psy_private_read on storage.objects for select to authenticated
 using(bucket_id in ('psy-projects','psy-submissions') and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy psy_private_upload on storage.objects for insert to authenticated
 with check(bucket_id in ('psy-projects','psy-submissions') and (storage.foldername(name))[1]=(select auth.uid())::text);
grant all on public.psy_projects,public.psy_submissions,public.psy_publications,public.psy_generation_usage,public.psy_generation_budget to service_role;
commit;
