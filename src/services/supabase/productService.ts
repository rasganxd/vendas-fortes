
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
          main_unit:units!products_main_unit_id_fkey(code, description, package_quantity),
          sub_unit:units!products_sub_unit_id_fkey(code, description, package_quantity)
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
      
      // Transform database fields to Product interface with automatic subunit ratio calculation
      const transformedProducts = (data as any[]).map((item: any, index: number) => {
        console.log(`🔄 [ProductService] Transforming product ${index + 1}:`, {
          id: item.id,
          code: item.code,
          name: item.name,
          cost: item.cost,
          sale_price: item.sale_price,
          stock: item.stock,
          main_unit: item.main_unit,
          sub_unit: item.sub_unit
        });
        
        // Calculate subunit ratio from units data
        let subunitRatio = 1;
        if (item.sub_unit && item.main_unit && item.sub_unit.package_quantity) {
          subunitRatio = Number(item.sub_unit.package_quantity) || 1;
          console.log(`📦 [ProductService] Calculated subunit ratio for ${item.name}: ${subunitRatio}`);
        }
        
        const product = {
          id: item.id,
          code: item.code,
          name: item.name,
          description: item.description || '',
          cost: Number(item.cost) || 0,
          price: Number(item.price || item.sale_price) || 0,
          stock: Number(item.stock) || 0,
          minStock: 0,
          maxDiscountPercent: Number(item.max_discount_percent) || 0,
          maxPrice: undefined,
          unit: item.main_unit?.code || 'UN',
          subunit: item.sub_unit?.code || undefined,
          hasSubunit: !!item.sub_unit_id,
          subunitRatio: subunitRatio, // Calculated from units table
          categoryId: item.category_id,
          groupId: item.group_id,
          brandId: item.brand_id,
          active: item.active !== false, // Default to true if undefined
          createdAt: new Date(item.created_at),
          updatedAt: new Date(item.updated_at),
          syncStatus: 'synced' as 'synced' | 'pending' | 'error'
        };
        
        console.log(`✅ [ProductService] Transformed product ${index + 1}:`, {
          id: product.id,
          name: product.name,
          cost: product.cost,
          price: product.price,
          stock: product.stock,
          subunitRatio: product.subunitRatio
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
      
      const { data: productData, error } = await supabase
        .from('products')
        .select(`
          *,
          main_unit:units!products_main_unit_id_fkey(code, description, package_quantity),
          sub_unit:units!products_sub_unit_id_fkey(code, description, package_quantity)
        `)
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('❌ [ProductService] Erro ao buscar produto:', error);
        return null;
      }
      
      // Calculate subunit ratio from units data
      const item = productData as any;
      let subunitRatio = 1;
      if (item.sub_unit && item.main_unit && item.sub_unit.package_quantity) {
        subunitRatio = Number(item.sub_unit.package_quantity) || 1;
      }
      
      // Transform database fields to Product interface
      return {
        id: item.id,
        code: item.code,
        name: item.name,
        description: item.description || '',
        cost: Number(item.cost) || 0,
        price: Number(item.price || item.sale_price) || 0,
        stock: Number(item.stock) || 0,
        minStock: 0,
        maxDiscountPercent: Number(item.max_discount_percent) || 0,
        maxPrice: undefined,
        unit: item.main_unit?.code || 'UN',
        subunit: item.sub_unit?.code || undefined,
        hasSubunit: !!item.sub_unit_id,
        subunitRatio: subunitRatio, // Calculated from units table
        categoryId: item.category_id,
        groupId: item.group_id,
        brandId: item.brand_id,
        active: item.active !== false, // Default to true if undefined
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at),
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
    console.log('💰 [ProductService] Cost value received:', product.cost, 'Type:', typeof product.cost);
    
    // Get unit IDs from codes
    const mainUnitId = await this.getUnitIdByCode(product.unit || 'UN');
    let subUnitId = null;
    
    if (product.hasSubunit && product.subunit) {
      subUnitId = await this.getUnitIdByCode(product.subunit);
    }
    
    if (!mainUnitId) {
      throw new Error(`Unidade principal '${product.unit}' não encontrada`);
    }
    
    // Ensure cost is a proper number
    const costValue = Number(product.cost) || 0;
    console.log('💰 [ProductService] Converted cost value:', costValue, 'Type:', typeof costValue);
    
    // Prepare data for Supabase - price defaults to cost initially
    const productData = {
      code: product.code,
      name: product.name,
      cost: costValue, // Use 'cost' field (Cloud schema)
      price: Number(product.price) || costValue, // Default to cost if no price provided
      stock: Number(product.stock) || 0,
      max_discount_percent: Number(product.maxDiscountPercent) || 0,
      category_id: product.categoryId || null,
      group_id: product.groupId || null,
      brand_id: product.brandId || null,
      main_unit_id: mainUnitId,
      sub_unit_id: subUnitId,
      active: product.active !== false // Default to true if undefined
    };

    console.log('📝 [ProductService] Supabase product data:', productData);
    console.log('💰 [ProductService] Final cost for database:', productData.cost);

    const { data, error } = await supabase
      .from('products')
      .insert([productData])
      .select(`
        *,
        main_unit:units!products_main_unit_id_fkey(code, description, package_quantity),
        sub_unit:units!products_sub_unit_id_fkey(code, description, package_quantity)
      `)
      .single();
    
    if (error) {
      console.error('❌ [ProductService] Erro ao criar produto:', error);
      throw error;
    }

    console.log('📊 [ProductService] Raw response from Supabase:', data);
    console.log('💰 [ProductService] Returned cost from database:', (data as any).cost);

    // Calculate subunit ratio from units data
    const resultData = data as any;
    let subunitRatio = 1;
    if (resultData.sub_unit && resultData.main_unit && resultData.sub_unit.package_quantity) {
      subunitRatio = Number(resultData.sub_unit.package_quantity) || 1;
    }

    // Transform the response to match our Product interface
    const createdProduct: Product = {
      id: resultData.id,
      code: resultData.code,
      name: resultData.name,
      description: resultData.description || '',
      cost: Number(resultData.cost),
      price: Number(resultData.price || resultData.sale_price),
      stock: Number(resultData.stock),
      minStock: 0,
      maxDiscountPercent: Number(resultData.max_discount_percent) || 0,
      maxPrice: undefined,
      unit: resultData.main_unit?.code || 'UN',
      subunit: resultData.sub_unit?.code || undefined,
      hasSubunit: !!resultData.sub_unit_id,
      subunitRatio: subunitRatio, // Calculated from units table
      categoryId: resultData.category_id,
      groupId: resultData.group_id,
      brandId: resultData.brand_id,
      active: resultData.active !== false, // Default to true if undefined
      createdAt: new Date(resultData.created_at),
      updatedAt: new Date(resultData.updated_at),
      syncStatus: 'synced' as 'synced' | 'pending' | 'error'
    };

    console.log('✅ [ProductService] Created product with final cost:', createdProduct.cost);
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
    
    // Prepare data for Supabase
    const updateData: any = {};
    
    if (product.code !== undefined) updateData.code = product.code;
    if (product.name !== undefined) updateData.name = product.name;
    if (product.cost !== undefined) updateData.cost = Number(product.cost);
    if (product.price !== undefined) {
      updateData.price = Number(product.price);
      console.log(`💰 [ProductService] Setting price to: ${updateData.price}`);
    }
    if (product.stock !== undefined) updateData.stock = Number(product.stock);
    if (product.maxDiscountPercent !== undefined) {
      updateData.max_discount_percent = Number(product.maxDiscountPercent);
      console.log(`💯 [ProductService] Setting max_discount_percent to: ${updateData.max_discount_percent}`);
    }
    if (product.categoryId !== undefined) updateData.category_id = product.categoryId;
    if (product.groupId !== undefined) updateData.group_id = product.groupId;
    if (product.brandId !== undefined) updateData.brand_id = product.brandId;
    if (product.active !== undefined) updateData.active = product.active;
    if (mainUnitId !== undefined) updateData.main_unit_id = mainUnitId;
    if (subUnitId !== undefined) updateData.sub_unit_id = subUnitId;

    console.log('🔄 [ProductService] Updating product with data:', updateData);

    const { data, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        main_unit:units!products_main_unit_id_fkey(code, description, package_quantity),
        sub_unit:units!products_sub_unit_id_fkey(code, description, package_quantity)
      `)
      .single();
    
    if (error) {
      console.error('❌ [ProductService] Erro ao atualizar produto:', error);
      throw error;
    }

    // Calculate subunit ratio from units data
    const resultData = data as any;
    let subunitRatio = 1;
    if (resultData.sub_unit && resultData.main_unit && resultData.sub_unit.package_quantity) {
      subunitRatio = Number(resultData.sub_unit.package_quantity) || 1;
    }

    // Transform the response to match our Product interface
    return {
      id: resultData.id,
      code: resultData.code,
      name: resultData.name,
      description: resultData.description || '',
      cost: Number(resultData.cost),
      price: Number(resultData.price || resultData.sale_price),
      stock: Number(resultData.stock),
      minStock: 0,
      maxDiscountPercent: Number(resultData.max_discount_percent) || 0,
      maxPrice: undefined,
      unit: resultData.main_unit?.code || 'UN',
      subunit: resultData.sub_unit?.code || undefined,
      hasSubunit: !!resultData.sub_unit_id,
      subunitRatio: subunitRatio, // Calculated from units table
      categoryId: resultData.category_id,
      groupId: resultData.group_id,
      brandId: resultData.brand_id,
      active: resultData.active !== false, // Default to true if undefined
      createdAt: new Date(resultData.created_at),
      updatedAt: new Date(resultData.updated_at),
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
