-- Keep the live Supabase permission fix reproducible in fresh environments.
-- RLS policies continue to control which rows/actions authenticated users may access.
GRANT UPDATE ON TABLE public.teacher_applications TO authenticated;
GRANT INSERT ON TABLE public.user_roles TO authenticated;
