
import { createContext } from 'react';
import { AppContextType } from './AppContextTypes';
import defaultContextValues from './defaultContextValues';

// Create and export the context with default values
export const AppContext = createContext<AppContextType>(defaultContextValues);
