// Shared React Context instances to avoid conflicts
import { createContext } from 'react';

// Create contexts once and export them
export const AuthContext = createContext(null);
export const CartContext = createContext(null);

// Debug logging for development
if (process.env.NODE_ENV === 'development') {
    console.log('🔧 Shared AuthContext created:', AuthContext);
    console.log('🛒 Shared CartContext created:', CartContext);
}