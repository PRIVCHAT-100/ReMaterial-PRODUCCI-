-- Habilitar RLS y crear políticas para la tabla companies
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Crear políticas para companies
CREATE POLICY "Companies are viewable by everyone" ON public.companies
FOR SELECT USING (true);

CREATE POLICY "Users can create their own company" ON public.companies
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own company" ON public.companies
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own company" ON public.companies
FOR DELETE USING (auth.uid() = user_id);

-- Habilitar RLS para la tabla EMPRESA
ALTER TABLE public."EMPRESA" ENABLE ROW LEVEL SECURITY;

-- Crear políticas básicas para EMPRESA (si se usa)
CREATE POLICY "EMPRESA is viewable by everyone" ON public."EMPRESA"
FOR SELECT USING (true);

-- Crear función para reparar datos existentes
CREATE OR REPLACE FUNCTION repair_user_company_links()
RETURNS TEXT AS $$
DECLARE
  repair_count INTEGER := 0;
  profile_record RECORD;
BEGIN
  -- Reparar enlaces entre profiles y companies
  FOR profile_record IN 
    SELECT id, email, company_name, sector, location, phone, contact_name, website
    FROM profiles 
    WHERE is_seller = true 
    AND company_name IS NOT NULL
    AND id NOT IN (SELECT user_id FROM companies WHERE user_id IS NOT NULL)
  LOOP
    -- Insertar en companies si no existe
    INSERT INTO companies (user_id, "Name", sector, location, telefono, description)
    VALUES (
      profile_record.id,
      COALESCE(profile_record.company_name, 'Empresa'),
      profile_record.sector,
      profile_record.location,
      CASE 
        WHEN profile_record.phone ~ '^[0-9]+$' THEN profile_record.phone::numeric
        ELSE 0
      END,
      'Empresa registrada'
    )
    ON CONFLICT (user_id) DO NOTHING;
    
    repair_count := repair_count + 1;
  END LOOP;
  
  -- Reparar seller_id en productos para que apunten al user_id correcto
  UPDATE products 
  SET seller_id = p.id
  FROM profiles p
  WHERE products.seller_id IS NULL 
  OR products.seller_id NOT IN (SELECT id FROM profiles);
  
  RETURN 'Reparados ' || repair_count || ' enlaces de empresas y productos actualizados';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;