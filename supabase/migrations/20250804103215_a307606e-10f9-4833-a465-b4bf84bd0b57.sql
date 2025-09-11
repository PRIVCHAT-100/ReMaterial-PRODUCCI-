-- Primero, corregir los seller_id de productos que apuntan a IDs inexistentes
-- Asignar los productos al primer perfil válido disponible
UPDATE products 
SET seller_id = (SELECT id FROM profiles LIMIT 1)
WHERE seller_id NOT IN (SELECT id FROM profiles);

-- Ahora crear la foreign key constraint
ALTER TABLE public.products 
ADD CONSTRAINT products_seller_id_fkey 
FOREIGN KEY (seller_id) REFERENCES public.profiles(id) ON DELETE CASCADE;