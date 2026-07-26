-- contact_messages is written only by the server (service_role) after
-- validation + rate limiting. authenticated may manage rows in admin.
-- anon has no privileges.

grant select, insert on public.contact_messages to service_role;
