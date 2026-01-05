-- Add foreign key constraints for campaigns and campaign_participants
ALTER TABLE public.campaigns
ADD CONSTRAINT campaigns_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.campaign_participants
ADD CONSTRAINT campaign_participants_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;