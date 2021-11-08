-- dev only
drop schema if exists sendou_ink cascade;
drop schema if exists sendou_ink_private cascade;

create schema sendou_ink;
create schema sendou_ink_private;

create function sendou_ink_private.set_updated_at() returns trigger as $$
begin
  new.updated_at := current_timestamp;
  return new;
end;
$$ language plpgsql;

-- ACCOUNT

-- no checks because this data is not provided by user but with the log in event
create table sendou_ink.account (
  id                    serial primary key,
  discord_username      text not null,
  discord_discriminator text not null,
  discord_avatar        text,
  twitch                text,
  twitter               text,
  youtube_id            text,
  youtube_name          text,
  created_at            timestamp default now(),
  updated_at            timestamp default now()
);

comment on table sendou_ink.account is 'User containing all information automatically fetched on log in.';
comment on column sendou_ink.account.id is 'The primary unique identifier for the user.';
comment on column sendou_ink.account.discord_username is 'User’s username on Discord.';
comment on column sendou_ink.account.discord_discriminator is 'User’s discriminator on Discord. (e.g. "0043")';
comment on column sendou_ink.account.discord_avatar is 'User’s Discord avatar hash.';
comment on column sendou_ink.account.twitch is 'User’s username on Twitch.';
comment on column sendou_ink.account.twitter is 'User’s username on Twitter.';
comment on column sendou_ink.account.youtube_id is 'User’s id on YouTube.';
comment on column sendou_ink.account.youtube_name is 'User’s name on YouTube (YouTube partners only).';
comment on column sendou_ink.account.created_at is 'The time this user was created.';

create function sendou_ink.account_discord_full_username(account sendou_ink.account) returns text as $$
  select account.discord_username || '#' || account.discord_discriminator
$$ language sql stable;

comment on function sendou_ink.account_discord_full_username(sendou_ink.account) is 'A user’s full username on Discord consisting of username and discriminator joined together with #.';

create trigger account_updated_at before update
  on sendou_ink.account
  for each row
  execute procedure sendou_ink_private.set_updated_at();

-- ORGANIZATION

create table sendou_ink.organization (
  identifier            text primary key 
                          check (identifier ~ '^[a-z0-9-]{2,50}$'),
  name                  text not null
                          check (char_length(name) < 51),
  discord_invite_code   text not null
                          check (char_length(discord_invite_code) < 51),
  twitter               text 
                          check (twitter ~ '^[a-zA-Z0-9_]{4,15}$'),
  created_at            timestamp default now(),
  updated_at            timestamp default now(),
  owner_id              integer not null references sendou_ink.account(id)
);

create function sendou_ink.organization_twitter_url(organization sendou_ink.organization) returns text as $$
  select 'https://twitter.com/' || organization.twitter
$$ language sql stable;

create function sendou_ink.organization_discord_invite_url(organization sendou_ink.organization) returns text as $$
  select 'https://discord.com/invite/' || organization.discord_invite_code
$$ language sql stable;

create index organization_owner_id on sendou_ink.organization (owner_id);

create trigger organization_updated_at before update
  on sendou_ink.organization
  for each row
  execute procedure sendou_ink_private.set_updated_at();

-- TOURNAMENT

create table sendou_ink.tournament (
  identifier                 text primary key
                               check (identifier ~ '^[a-z0-9-]{2,50}$'),
  name                       text not null
                               check (char_length(name) < 51),
  description                text
                               check (char_length(description) < 5000),
  start_time                 timestamp not null
                              check (start_time > now()),
  check_in_time              timestamp,
  -- TODO check
  banner_background          text not null,
  banner_text_hsl_args       text not null
                              check (banner_text_hsl_args ~ '^[0-9]{1,3} [0-9]{1,3}% [0-9]{1,3}%$'),
  created_at                 timestamp default now(),
  updated_at                 timestamp default now(),
  organization_identifier    text not null references sendou_ink.organization(identifier),
  CHECK (check_in_time < start_time)
);

-- create function sendou_ink.tournament_text_color(tournament sendou_ink.tournament) returns text as $$
--   select 'hsl(' || tournament.banner_text_hsl_args || ')'
-- $$ language sql stable;

create index tournament_organization_identifier on sendou_ink.tournament(organization_identifier);

create trigger tournament_updated_at before update
  on sendou_ink.tournament
  for each row
  execute procedure sendou_ink_private.set_updated_at();

create table sendou_ink.mode_enum (
  name text primary key
);
comment on table sendou_ink.mode_enum is E'@enum';
insert into sendou_ink.mode_enum (name) values
  ('TW'),
  ('SZ'),
  ('TC'),
  ('RM'),
  ('CB');

create table sendou_ink.map_mode (
  id          serial primary key,
  stage       text not null,
  game_mode   text not null references sendou_ink.mode_enum(name),
  unique (stage, game_mode)
);

create table sendou_ink.map_pool (
  tournament_identifier   text not null references sendou_ink.tournament(identifier),
  map_mode_id             integer not null references sendou_ink.map_mode(id),
  unique (tournament_identifier, map_mode_id)
);

create index map_pool_tournament_identifier on sendou_ink.map_pool(tournament_identifier);
create index map_pool_map_mode_id on sendou_ink.map_pool(map_mode_id);
