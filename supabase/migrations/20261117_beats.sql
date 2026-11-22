-- Beat library for the Music page. Run once in Supabase > SQL Editor.
-- Upload = publish: every audio file in the "beats" storage bucket appears in the player, titled from its file name
-- ("night-drive_v2.mp3" -> "Night Drive V2"). The beats table is optional: add a row with the same audio_path to set a
-- nicer title, genre, bpm, cover or order, or set published = false to hide a file. Visitors can only read.

-- 1. public bucket, 50 MB per file (free-plan max). Only you (dashboard) can upload or delete.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('beats', 'beats', true, 52428800,
        array['audio/mpeg', 'audio/wav', 'audio/x-wav', 'audio/wave', 'audio/flac', 'audio/aac', 'audio/mp4', 'audio/x-m4a',
              'image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

-- 2. let the site list the files in that bucket (read only)
create policy "anyone can list beats"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'beats');

-- 3. optional details per file
create table if not exists public.beats (
  id          uuid primary key default gen_random_uuid(),
  title       text,
  genre       text,
  bpm         int check (bpm between 40 and 300),
  audio_path  text not null unique,   -- file name inside the "beats" bucket, e.g. "night-drive.mp3"
  cover_path  text,                   -- optional square image in the same bucket
  sort        int not null default 0, -- lower plays first
  published   boolean not null default true,
  created_at  timestamptz not null default now()
);

alter table public.beats enable row level security;

create policy "anyone can read beats"
  on public.beats for select
  to anon, authenticated
  using (true);
