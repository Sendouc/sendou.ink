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

-- seed for dev

insert into sendou_ink.account (discord_username, discord_discriminator, discord_avatar, twitch, twitter, youtube_id, youtube_name)
values ('Sendou', '0043', 'fcfd65a3bea598905abb9ca25296816b', 'Sendou', 'Sendouc', 'UCWbJLXByvsfQvTcR4HLPs5Q', 'Sendou')
