
import { supabase } from '@/integrations/supabase/client';
import { ImportReportData } from '@/services/mobileImportReportService';
import { ImportHistoryRecord } from '@/types/importHistory';

class ImportReportPersistenceService {
  async saveImportReport(report: ImportReportData): Promise<void> {
    try {
      console.log('💾 Saving import report to database...');
      
      const { error } = await supabase
        .from('import_reports')
        .insert({
          timestamp: report.timestamp.toISOString(),
          operation_type: report.operationType,
          operator: report.operator,
          summary_data: report.summary as any,
          report_data: report as any,
          orders_count: report.summary.totalOrders,
          total_value: report.summary.totalValue,
          sales_reps_count: report.summary.salesRepsCount
        });

      if (error) {
        console.error('❌ Error saving import report:', error);
        throw error;
      }

      console.log('✅ Import report saved successfully');
    } catch (error) {
      console.error('❌ Error in saveImportReport:', error);
      throw error;
    }
  }

  async getImportHistory(): Promise<ImportHistoryRecord[]> {
    try {
      console.log('📊 Loading import history...');
      
      const { data, error } = await supabase
        .from('import_reports')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(50);

      if (error) {
        console.error('❌ Error loading import history:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        console.log('📝 No import history found');
        return [];
      }

      const history = data.map(record => ({
        id: record.id,
        timestamp: new Date(record.timestamp),
        operationType: record.operation_type as 'import' | 'reject',
        operator: record.operator,
        ordersCount: record.orders_count,
        totalValue: record.total_value,
        salesRepsCount: record.sales_reps_count,
        reportData: record.report_data as ImportReportData,
        createdAt: new Date(record.created_at)
      }));

      console.log(`✅ Found ${history.length} import history records`);
      return history;
    } catch (error) {
      console.error('❌ Error in getImportHistory:', error);
      throw error;
    }
  }

  async getImportReport(reportId: string): Promise<ImportReportData | null> {
    try {
      console.log(`📋 Loading import report ${reportId}...`);
      
      const { data, error } = await supabase
        .from('import_reports')
        .select('report_data')
        .eq('id', reportId)
        .single();

      if (error) {
        console.error('❌ Error loading import report:', error);
        throw error;
      }

      if (!data) {
        console.log('📝 No import report found');
        return null;
      }

      console.log('✅ Import report loaded successfully');
      return data.report_data as ImportReportData;
    } catch (error) {
      console.error('❌ Error in getImportReport:', error);
      throw error;
    }
  }
}

export const importReportPersistenceService = new ImportReportPersistenceService();
