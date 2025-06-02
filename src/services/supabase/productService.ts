
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types';
import { productUnitsMappingService } from './productUnitsMapping';

export const productService = {
  async getAll(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('code');
    
    if (error) {
      console.error('Erro ao buscar produtos:', error);
      throw error;
    }
    
    // Transform database fields to Product interface
    return (data || []).map(item => ({
      id: item.id,
      code: item.code,
      name: item.name,
      description: item.description || '',
      cost: item.cost || 0,
      price: item.price || 0,
      stock: item.stock || 0,
      minStock: item.min_stock || 0,
      minPrice: item.min_price || undefined,
      maxPrice: item.max_price || undefined,
      unit: item.unit || 'UN',
      subunit: item.subunit || undefined,
      hasSubunit: item.has_subunit || false,
      subunitRatio: item.subunit_ratio || 1,
      categoryId: item.category_id,
      groupId: item.group_id,
      brandId: item.brand_id,
      mainUnitId: item.main_unit_id,
      createdAt: new Date(item.created_at),
      updatedAt: new Date(item.updated_at),
      syncStatus: (item.sync_status || 'synced') as 'synced' | 'pending' | 'error'
    }));
  },

  async getById(id: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Erro ao buscar produto:', error);
      return null;
    }
    
    // Transform database fields to Product interface
    return {
      id: data.id,
      code: data.code,
      name: data.name,
      description: data.description || '',
      cost: data.cost || 0,
      price: data.price || 0,
      stock: data.stock || 0,
      minStock: data.min_stock || 0,
      minPrice: data.min_price || undefined,
      maxPrice: data.max_price || undefined,
      unit: data.unit || 'UN',
      subunit: data.subunit || undefined,
      hasSubunit: data.has_subunit || false,
      subunitRatio: data.subunit_ratio || 1,
      categoryId: data.category_id,
      groupId: data.group_id,
      brandId: data.brand_id,
      mainUnitId: data.main_unit_id,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      syncStatus: (data.sync_status || 'synced') as 'synced' | 'pending' | 'error'
    };
  },

  async create(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'> & { selectedUnits?: any[], mainUnitId?: string }): Promise<Product> {
    console.log('Creating product with data:', product);
    
    // Iniciar transação para garantir consistência
    const { data: productData, error: productError } = await supabase
      .from('products')
      .insert([{
        code: product.code,
        name: product.name,
        description: product.description || '',
        cost: product.cost || 0,
        price: product.price || 0,
        stock: product.stock || 0,
        min_stock: product.minStock || 0,
        min_price: product.minPrice || null,
        max_price: product.maxPrice || null,
        unit: product.unit || 'UN',
        subunit: product.subunit || null,
        has_subunit: product.hasSubunit || false,
        subunit_ratio: product.subunitRatio || 1,
        category_id: product.categoryId || null,
        group_id: product.groupId || null,
        brand_id: product.brandId || null,
        main_unit_id: product.mainUnitId || null,
        sync_status: product.syncStatus || 'synced'
      }])
      .select()
      .single();
    
    if (productError) {
      console.error('Erro ao criar produto:', productError);
      throw productError;
    }

    // Se há unidades selecionadas, criar os mapeamentos
    if (product.selectedUnits && product.selectedUnits.length > 0) {
      try {
        // Adicionar cada unidade ao produto
        for (const unit of product.selectedUnits) {
          await productUnitsMappingService.addUnitToProduct(
            productData.id,
            unit.unitId,
            unit.isMainUnit
          );
        }

        // Se há uma unidade principal definida, atualizar o produto
        if (product.mainUnitId) {
          const { error: updateError } = await supabase
            .from('products')
            .update({ 
              main_unit_id: product.mainUnitId,
              unit: product.selectedUnits.find(u => u.isMainUnit)?.unitValue || 'UN'
            })
            .eq('id', productData.id);

          if (updateError) {
            console.error('Erro ao atualizar main_unit_id:', updateError);
            // Não falhar completamente, apenas logar o erro
          }
        }

        console.log('✅ Unidades associadas ao produto com sucesso');
      } catch (error) {
        console.error('❌ Erro ao associar unidades:', error);
        // Não falhar a criação do produto, apenas logar o erro
      }
    }

    // Retornar produto criado com interface correta
    const createdProduct: Product = {
      id: productData.id,
      code: productData.code,
      name: productData.name,
      description: productData.description,
      cost: productData.cost,
      price: productData.price,
      stock: productData.stock,
      minStock: productData.min_stock,
      minPrice: productData.min_price || undefined,
      maxPrice: productData.max_price || undefined,
      unit: productData.unit,
      subunit: productData.subunit || undefined,
      hasSubunit: productData.has_subunit || false,
      subunitRatio: productData.subunit_ratio || 1,
      categoryId: productData.category_id,
      groupId: productData.group_id,
      brandId: productData.brand_id,
      mainUnitId: productData.main_unit_id,
      createdAt: new Date(productData.created_at),
      updatedAt: new Date(productData.updated_at),
      syncStatus: (productData.sync_status || 'synced') as 'synced' | 'pending' | 'error'
    };

    console.log('Created product:', createdProduct);
    return createdProduct;
  },

  async update(id: string, product: Partial<Product> & { selectedUnits?: any[], mainUnitId?: string }): Promise<Product> {
    console.log('Updating product:', id, product);
    
    // Preparar dados para atualização do produto
    const updateData: any = {};
    
    if (product.code !== undefined) updateData.code = product.code;
    if (product.name !== undefined) updateData.name = product.name;
    if (product.description !== undefined) updateData.description = product.description;
    if (product.cost !== undefined) updateData.cost = product.cost;
    if (product.price !== undefined) updateData.price = product.price;
    if (product.stock !== undefined) updateData.stock = product.stock;
    if (product.minStock !== undefined) updateData.min_stock = product.minStock;
    if (product.minPrice !== undefined) updateData.min_price = product.minPrice;
    if (product.maxPrice !== undefined) updateData.max_price = product.maxPrice;
    if (product.unit !== undefined) updateData.unit = product.unit;
    if (product.subunit !== undefined) updateData.subunit = product.subunit;
    if (product.hasSubunit !== undefined) updateData.has_subunit = product.hasSubunit;
    if (product.subunitRatio !== undefined) updateData.subunit_ratio = product.subunitRatio;
    if (product.categoryId !== undefined) updateData.category_id = product.categoryId;
    if (product.groupId !== undefined) updateData.group_id = product.groupId;
    if (product.brandId !== undefined) updateData.brand_id = product.brandId;
    if (product.syncStatus !== undefined) updateData.sync_status = product.syncStatus;

    // Se há unidades sendo atualizadas
    if (product.selectedUnits) {
      // Remover todas as unidades existentes
      await supabase
        .from('product_units_mapping')
        .delete()
        .eq('product_id', id);

      // Adicionar as novas unidades
      for (const unit of product.selectedUnits) {
        await productUnitsMappingService.addUnitToProduct(
          id,
          unit.unitId,
          unit.isMainUnit
        );
      }

      // Atualizar main_unit_id e unit no produto
      if (product.mainUnitId) {
        updateData.main_unit_id = product.mainUnitId;
        const mainUnit = product.selectedUnits.find(u => u.isMainUnit);
        if (mainUnit) {
          updateData.unit = mainUnit.unitValue;
        }
      }
    } else if (product.mainUnitId !== undefined) {
      updateData.main_unit_id = product.mainUnitId;
    }

    const { data, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Erro ao atualizar produto:', error);
      throw error;
    }

    // Transform the response to match our Product interface
    return {
      id: data.id,
      code: data.code,
      name: data.name,
      description: data.description,
      cost: data.cost,
      price: data.price,
      stock: data.stock,
      minStock: data.min_stock,
      minPrice: data.min_price || undefined,
      maxPrice: data.max_price || undefined,
      unit: data.unit,
      subunit: data.subunit || undefined,
      hasSubunit: data.has_subunit || false,
      subunitRatio: data.subunit_ratio || 1,
      categoryId: data.category_id,
      groupId: data.group_id,
      brandId: data.brand_id,
      mainUnitId: data.main_unit_id,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      syncStatus: (data.sync_status || 'synced') as 'synced' | 'pending' | 'error'
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
