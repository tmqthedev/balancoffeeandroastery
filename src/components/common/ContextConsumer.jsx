import React from 'react';
import { useAuth } from '../../constants/authConstants';
import { useCart } from '../../constants/cartConstants';

// Safe context consumer component
const ContextConsumer = ({ children }) => {
    try {
        const auth = useAuth();
        const cart = useCart();
        
        return children({ auth, cart });
    } catch (error) {
        console.error('❌ Context error in ContextConsumer:', error);
        
        // Fallback context values
        const fallbackAuth = {
            user: null,
            isAuthenticated: false,
            logout: () => Promise.resolve()
        };
        
        const fallbackCart = {
            getCartTotals: () => ({ itemCount: 0 })
        };
        
        return children({ 
            auth: fallbackAuth, 
            cart: fallbackCart 
        });
    }
};

export default ContextConsumer;