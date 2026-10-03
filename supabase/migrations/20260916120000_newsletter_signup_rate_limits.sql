-- Newsletter popup rate limiting (server-side only via service_role).
-- Holds hashed bucket keys (e.g. SHA-256 of client IP) for short sliding
-- windows only — mirrors contact_form_rate_limits.

create table public.newsletter_signup_rate_limits (
  bucket_key text primary key,
  window_started_at timestamptz not null,
  hit_count integer not null default 0 check (hit_count >= 0),
  updated_at timestamptz not null default now()
);

comment on table public.newsletter_signup_rate_limits is
  'Short-lived rate-limit buckets for the public newsletter signup popup. '
  'Accessible only via service_role. Not part of the public content model.';

alter table public.newsletter_signup_rate_limits enable row level security;

revoke all on table public.newsletter_signup_rate_limits from anon, authenticated;
grant select, insert, update, delete on table public.newsletter_signup_rate_limits to service_role;
