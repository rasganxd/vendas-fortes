
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types';

export const productService = {
  async getAll(): Promise<Product[]> {
    try {
      console.log("🔄 [ProductService] Starting to fetch products from Supabase...");
      
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          main_unit:units!products_main_unit_id_fkey(code, description),
          sub_unit:units!products_sub_unit_id_fkey(code, description)
        `)
        .order('code');
      
      if (error) {
        console.error('❌ [ProductService] Erro ao buscar produtos:', error);
        throw error;
      }
      
      console.log("📊 [ProductService] Raw data from Supabase:", data);
      console.log("📊 [ProductService] Data length:", data?.length || 0);
      
      if (!data || data.length === 0) {
        console.log("📋 [ProductService] No products found in database");
        return [];
      }
      
      // Transform database fields to Product interface with detailed logging
      const transformedProducts = data.map((item, index) => {
        console.log(`🔄 [ProductService] Transforming product ${index + 1}:`, {
          id: item.id,
          code: item.code,
          name: item.name,
          cost_price: item.cost_price,
          sale_price: item.sale_price,
          stock: item.stock
        });
        
        const product = {
          id: item.id,
          code: item.code,
          name: item.name,
          description: '', // Database doesn't have description field
          cost: Number(item.cost_price) || 0, // CORRIGIDO: cost_price → cost
          price: Number(item.sale_price) || 0, // CORRIGIDO: sale_price → price
          stock: Number(item.stock) || 0,
          minStock: 0,
          maxDiscountPercent: Number(item.max_discount_percent) || 0,
          maxPrice: undefined,
          unit: item.main_unit?.code || 'UN',
          subunit: item.sub_unit?.code || undefined,
          hasSubunit: !!item.sub_unit_id,
          subunitRatio: 1,
          categoryId: item.category_id,
          groupId: item.group_id,
          brandId: item.brand_id,
          createdAt: new Date(item.created_at),
          updatedAt: new Date(item.updated_at),
          syncStatus: 'synced' as 'synced' | 'pending' | 'error'
        };
        
        console.log(`✅ [ProductService] Transformed product ${index + 1}:`, {
          id: product.id,
          name: product.name,
          cost: product.cost,
          price: product.price,
          stock: product.stock
        });
        
        return product;
      });
      
      console.log("✅ [ProductService] Successfully transformed", transformedProducts.length, "products");
      console.log("🎯 [ProductService] First product example:", transformedProducts[0]);
      return transformedProducts;
    } catch (error) {
      console.error('❌ [ProductService] Critical error in getAll:', error);
      throw error;
    }
  },

  async getById(id: string): Promise<Product | null> {
    try {
      console.log("🔍 [ProductService] Fetching product by ID:", id);
      
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          main_unit:units!products_main_unit_id_fkey(code, description),
          sub_unit:units!products_sub_unit_id_fkey(code, description)
        `)
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('❌ [ProductService] Erro ao buscar produto:', error);
        return null;
      }
      
      // Transform database fields to Product interface
      return {
        id: data.id,
        code: data.code,
        name: data.name,
        description: '',
        cost: Number(data.cost_price) || 0, // CORRIGIDO
        price: Number(data.sale_price) || 0, // CORRIGIDO
        stock: Number(data.stock) || 0,
        minStock: 0,
        maxDiscountPercent: Number(data.max_discount_percent) || 0,
        maxPrice: undefined,
        unit: data.main_unit?.code || 'UN',
        subunit: data.sub_unit?.code || undefined,
        hasSubunit: !!data.sub_unit_id,
        subunitRatio: 1,
        categoryId: data.category_id,
        groupId: data.group_id,
        brandId: data.brand_id,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        syncStatus: 'synced' as 'synced' | 'pending' | 'error'
      };
    } catch (error) {
      console.error('❌ [ProductService] Error in getById:', error);
      return null;
    }
  },

  async getUnitIdByCode(unitCode: string): Promise<string | null> {
    const { data, error } = await supabase
      .from('units')
      .select('id')
      .eq('code', unitCode)
      .single();
    
    if (error) {
      console.error('Erro ao buscar unidade por código:', error);
      return null;
    }
    
    return data?.id || null;
  },

  async create(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    console.log('🔄 [ProductService] Creating product with data:', product);
    
    // Get unit IDs from codes
    const mainUnitId = await this.getUnitIdByCode(product.unit || 'UN');
    let subUnitId = null;
    
    if (product.hasSubunit && product.subunit) {
      subUnitId = await this.getUnitIdByCode(product.subunit);
    }
    
    if (!mainUnitId) {
      throw new Error(`Unidade principal '${product.unit}' não encontrada`);
    }
    
    // Prepare data for Supabase - CORRIGIDO: Mapeamento correto para o banco
    const productData = {
      code: product.code,
      name: product.name,
      cost_price: Number(product.cost) || 0, // CORRIGIDO: cost → cost_price
      sale_price: Number(product.price) || Number(product.cost) || 0, // CORRIGIDO: price → sale_price
      stock: Number(product.stock) || 0,
      max_discount_percent: Number(product.maxDiscountPercent) || 0,
      category_id: product.categoryId || null,
      group_id: product.groupId || null,
      brand_id: product.brandId || null,
      main_unit_id: mainUnitId,
      sub_unit_id: subUnitId,
      active: true
    };

    console.log('📝 [ProductService] Supabase product data:', productData);

    const { data, error } = await supabase
      .from('products')
      .insert([productData])
      .select(`
        *,
        main_unit:units!products_main_unit_id_fkey(code, description),
        sub_unit:units!products_sub_unit_id_fkey(code, description)
      `)
      .single();
    
    if (error) {
      console.error('❌ [ProductService] Erro ao criar produto:', error);
      throw error;
    }

    // Transform the response to match our Product interface
    const createdProduct: Product = {
      id: data.id,
      code: data.code,
      name: data.name,
      description: '',
      cost: Number(data.cost_price), // CORRIGIDO
      price: Number(data.sale_price), // CORRIGIDO
      stock: Number(data.stock),
      minStock: 0,
      maxDiscountPercent: Number(data.max_discount_percent) || 0,
      maxPrice: undefined,
      unit: data.main_unit?.code || 'UN',
      subunit: data.sub_unit?.code || undefined,
      hasSubunit: !!data.sub_unit_id,
      subunitRatio: 1,
      categoryId: data.category_id,
      groupId: data.group_id,
      brandId: data.brand_id,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      syncStatus: 'synced' as 'synced' | 'pending' | 'error'
    };

    console.log('✅ [ProductService] Created product:', createdProduct);
    return createdProduct;
  },

  async update(id: string, product: Partial<Product>): Promise<Product> {
    // Get unit IDs from codes if units are being updated
    let mainUnitId = undefined;
    let subUnitId = undefined;
    
    if (product.unit) {
      mainUnitId = await this.getUnitIdByCode(product.unit);
      if (!mainUnitId) {
        throw new Error(`Unidade principal '${product.unit}' não encontrada`);
      }
    }
    
    if (product.hasSubunit && product.subunit) {
      subUnitId = await this.getUnitIdByCode(product.subunit);
      if (!subUnitId) {
        throw new Error(`Sub-unidade '${product.subunit}' não encontrada`);
      }
    } else if (product.hasSubunit === false) {
      subUnitId = null;
    }
    
    // Prepare data for Supabase - CORRIGIDO: Mapeamento correto
    const updateData: any = {};
    
    if (product.code !== undefined) updateData.code = product.code;
    if (product.name !== undefined) updateData.name = product.name;
    if (product.cost !== undefined) updateData.cost_price = Number(product.cost); // CORRIGIDO
    if (product.price !== undefined) updateData.sale_price = Number(product.price); // CORRIGIDO
    if (product.stock !== undefined) updateData.stock = Number(product.stock);
    if (product.maxDiscountPercent !== undefined) updateData.max_discount_percent = Number(product.maxDiscountPercent);
    if (product.categoryId !== undefined) updateData.category_id = product.categoryId;
    if (product.groupId !== undefined) updateData.group_id = product.groupId;
    if (product.brandId !== undefined) updateData.brand_id = product.brandId;
    if (mainUnitId !== undefined) updateData.main_unit_id = mainUnitId;
    if (subUnitId !== undefined) updateData.sub_unit_id = subUnitId;

    console.log('🔄 [ProductService] Updating product with data:', updateData);

    const { data, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        main_unit:units!products_main_unit_id_fkey(code, description),
        sub_unit:units!products_sub_unit_id_fkey(code, description)
      `)
      .single();
    
    if (error) {
      console.error('❌ [ProductService] Erro ao atualizar produto:', error);
      throw error;
    }

    // Transform the response to match our Product interface
    return {
      id: data.id,
      code: data.code,
      name: data.name,
      description: '',
      cost: Number(data.cost_price), // CORRIGIDO
      price: Number(data.sale_price), // CORRIGIDO
      stock: Number(data.stock),
      minStock: 0,
      maxDiscountPercent: Number(data.max_discount_percent) || 0,
      maxPrice: undefined,
      unit: data.main_unit?.code || 'UN',
      subunit: data.sub_unit?.code || undefined,
      hasSubunit: !!data.sub_unit_id,
      subunitRatio: 1,
      categoryId: data.category_id,
      groupId: data.group_id,
      brandId: data.brand_id,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      syncStatus: 'synced' as 'synced' | 'pending' | 'error'
    };
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Erro ao excluir produto:', error);
      throw error;
    }
  }
};
