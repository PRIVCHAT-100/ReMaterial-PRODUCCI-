-- Añadir nuevos campos a la tabla profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS tax_id text,
ADD COLUMN IF NOT EXISTS website text,
ADD COLUMN IF NOT EXISTS logo_url text,
ADD COLUMN IF NOT EXISTS social_links text,
ADD COLUMN IF NOT EXISTS certifications text;