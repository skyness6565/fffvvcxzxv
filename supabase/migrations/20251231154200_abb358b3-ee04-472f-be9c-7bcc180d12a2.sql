-- Enable realtime for profiles table to support real-time balance updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;