-- Fix: Remove invite_code column from families (use invites table instead)
ALTER TABLE public.families DROP COLUMN IF EXISTS invite_code;
