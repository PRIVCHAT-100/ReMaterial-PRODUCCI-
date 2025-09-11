-- Crear la foreign key constraint entre products.seller_id y profiles.id
ALTER TABLE public.products 
ADD CONSTRAINT products_seller_id_fkey 
FOREIGN KEY (seller_id) REFERENCES public.profiles(id) ON DELETE CASCADE;