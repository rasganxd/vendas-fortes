
/**
 * Utility to check if mock data mode is enabled
 * @returns boolean - true if mock data is enabled
 */
export const isMockDataEnabled = (): boolean => {
  // Check for a mock data flag in localStorage or environment variable
  const mockDataEnabled = localStorage.getItem('useMockData') === 'true' || false;
  return mockDataEnabled;
};
