import { supabase } from '@/integrations/supabase/client';

export const repairUserCompanyLinks = async () => {
  try {
    console.log('Iniciando reparación de datos...');
    
    // 1. Obtener perfiles de empresas sin registro en companies
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .eq('is_seller', true)
      .not('company_name', 'is', null);

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      return { success: false, message: profilesError.message };
    }

    console.log(`Encontrados ${profiles?.length || 0} perfiles de empresa`);

    // 2. Since companies table doesn't exist anymore, all data is in profiles
    // Skip this step as companies are now stored in profiles table

    // All company data is now stored in profiles table
    console.log('Company data is now stored in profiles table - no separate companies table needed');

    // 4. Verificar y corregir seller_id en productos
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, seller_id');

    if (productsError) {
      console.error('Error fetching products:', productsError);
      return { success: false, message: productsError.message };
    }

    console.log(`Verificando ${products?.length || 0} productos...`);

    // 5. Obtener todos los IDs de profiles válidos
    const { data: allProfiles, error: allProfilesError } = await supabase
      .from('profiles')
      .select('id');

    if (allProfilesError) {
      console.error('Error fetching all profiles:', allProfilesError);
      return { success: false, message: allProfilesError.message };
    }

    const validProfileIds = new Set(allProfiles?.map(p => p.id) || []);

    // 6. Encontrar productos con seller_id inválido
    const invalidProducts = products?.filter(product => 
      !product.seller_id || !validProfileIds.has(product.seller_id)
    ) || [];

    console.log(`Encontrados ${invalidProducts.length} productos con seller_id inválido`);

    // 7. Actualizar productos con seller_id inválido (asignar al primer perfil de empresa disponible)
    if (invalidProducts.length > 0 && profiles && profiles.length > 0) {
      const defaultSellerId = profiles[0].id; // Usar el primer perfil como vendedor por defecto
      
      for (const product of invalidProducts) {
        const { error: updateError } = await supabase
          .from('products')
          .update({ seller_id: defaultSellerId })
          .eq('id', product.id);

        if (updateError) {
          console.error(`Error updating product ${product.id}:`, updateError);
        }
      }
    }

    return {
      success: true,
      message: `Reparación completada: ${invalidProducts.length} productos corregidos`
    };

  } catch (error: any) {
    console.error('Error during repair:', error);
    return { success: false, message: error.message };
  }
};