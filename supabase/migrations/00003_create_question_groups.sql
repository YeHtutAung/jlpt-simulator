-- ================================
-- Migration: 00003_create_question_groups
-- ================================

create table if not exists question_groups (
  id           uuid primary key default uuid_generate_v4(),
  section_id   uuid not null references sections(id) on delete cascade,
  group_key    text not null,  -- e.g. "n5-2017-v-g1" for lookups
  group_type   text not null check (group_type in (
                 'text_only',
                 'text_with_passage',
                 'text_with_image',
                 'audio_only',
                 'audio_with_image',
                 'audio_with_text',
                 'sentence_order',
                 'fill_in_blank'
               )),
  instructions text,
  passage_text text,
  image_type   text check (image_type in ('svg','storage','none')),
  image_data   text,           -- SVG string OR storage URL
  image_alt    text,
  audio_url    text,
  order_index  integer not null default 0,
  created_at   timestamptz not null default now()
);

create index idx_question_groups_section_id on question_groups(section_id);
create index idx_question_groups_key on question_groups(group_key);
