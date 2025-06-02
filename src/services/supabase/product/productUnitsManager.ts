
import { supabase } from '@/integrations/supabase/client';
import { productUnitsMappingService } from '../productUnitsMapping';

/**
 * Manage product units associations
 */
export const productUnitsManager = {
  /**
   * Associate units with a product
   */
  async associateUnits(productId: string, selectedUnits: any[], mainUnitId?: string): Promise<void> {
    if (!selectedUnits || selectedUnits.length === 0) {
      return;
    }

    try {
      console.log(`🔗 Associating ${selectedUnits.length} units to product ${productId}`);
      
      // Add each unit to the product
      for (const unit of selectedUnits) {
        await productUnitsMappingService.addUnitToProduct(
          productId,
          unit.unitId,
          unit.isMainUnit
        );
      }

      // Update main_unit_id if specified
      if (mainUnitId) {
        const mainUnit = selectedUnits.find(u => u.isMainUnit);
        const updateData: any = { main_unit_id: mainUnitId };
        
        if (mainUnit) {
          updateData.unit = mainUnit.unitValue;
        }

        const { error: updateError } = await supabase
          .from('products')
          .update(updateData)
          .eq('id', productId);

        if (updateError) {
          console.error('Error updating main_unit_id:', updateError);
          // Don't fail completely, just log the error
        }
      }

      console.log('✅ Units associated successfully');
    } catch (error) {
      console.error('❌ Error associating units:', error);
      // Don't fail product creation, just log the error
    }
  },

  /**
   * Update product units associations
   */
  async updateUnits(productId: string, selectedUnits: any[], mainUnitId?: string): Promise<void> {
    if (!selectedUnits) {
      return;
    }

    // Remove all existing units
    await supabase
      .from('product_units_mapping')
      .delete()
      .eq('product_id', productId);

    // Add the new units
    for (const unit of selectedUnits) {
      await productUnitsMappingService.addUnitToProduct(
        productId,
        unit.unitId,
        unit.isMainUnit
      );
    }

    // Update main_unit_id and unit in product if specified
    if (mainUnitId) {
      const updateData: any = { main_unit_id: mainUnitId };
      const mainUnit = selectedUnits.find(u => u.isMainUnit);
      
      if (mainUnit) {
        updateData.unit = mainUnit.unitValue;
      }

      const { error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', productId);

      if (error) {
        console.error('Error updating product main unit:', error);
        throw error;
      }
    }
  }
};
