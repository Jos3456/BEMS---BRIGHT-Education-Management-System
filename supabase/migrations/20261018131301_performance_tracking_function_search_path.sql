-- Pin the trigger function search path to avoid mutable search_path risks.
alter function public.set_performance_tracking_updated_at() set search_path = '';