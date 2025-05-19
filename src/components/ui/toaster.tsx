
// This file is maintained for compatibility but the Toaster component is not used
// We've standardized on using the Sonner toast library instead
// The actual Toaster is now imported from src/components/ui/sonner.tsx

import React from 'react';

export function Toaster() {
  // This is an empty component that does nothing
  // It's kept for backward compatibility only
  console.log('Warning: Legacy Toaster component called. Use Sonner Toaster from App.tsx instead.');
  return null;
}
