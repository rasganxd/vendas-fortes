
// Helper functions for mock data generation

// Generate random ID
export const generateId = () => Math.random().toString(36).substring(2, 10);

// Helper to generate random date within the past 30 days
export const randomRecentDate = () => {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * 30));
  return date;
};

// Helper to generate future date
export const randomFutureDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + Math.floor(Math.random() * 14) + 1);
  return date;
};

// Current date for created/updated fields
export const currentDate = new Date();
