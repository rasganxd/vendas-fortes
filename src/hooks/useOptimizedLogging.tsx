
import { useCallback } from 'react';

interface LogConfig {
  enableDebug: boolean;
  enableVerbose: boolean;
  component?: string;
}

const DEFAULT_CONFIG: LogConfig = {
  enableDebug: process.env.NODE_ENV === 'development',
  enableVerbose: false
};

export const useOptimizedLogging = (config: Partial<LogConfig> = {}) => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  const logDebug = useCallback((message: string, data?: any) => {
    if (finalConfig.enableDebug) {
      const prefix = finalConfig.component ? `[${finalConfig.component}]` : '';
      console.log(`🔍 ${prefix} ${message}`, data || '');
    }
  }, [finalConfig]);

  const logError = useCallback((message: string, error?: any) => {
    const prefix = finalConfig.component ? `[${finalConfig.component}]` : '';
    console.error(`❌ ${prefix} ${message}`, error || '');
  }, [finalConfig]);

  const logSuccess = useCallback((message: string, data?: any) => {
    if (finalConfig.enableDebug) {
      const prefix = finalConfig.component ? `[${finalConfig.component}]` : '';
      console.log(`✅ ${prefix} ${message}`, data || '');
    }
  }, [finalConfig]);

  const logVerbose = useCallback((message: string, data?: any) => {
    if (finalConfig.enableVerbose) {
      const prefix = finalConfig.component ? `[${finalConfig.component}]` : '';
      console.log(`📝 ${prefix} ${message}`, data || '');
    }
  }, [finalConfig]);

  return { logDebug, logError, logSuccess, logVerbose };
};
