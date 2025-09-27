// Constants and utility functions for CartContext
import { useContext } from 'react';
import { CartContext } from '../context/CartContext';

export { CartContext };

export const useCart = () => {
    try {
        const context = useContext(CartContext);
        
        // If context is null or undefined, use fallback
        if (context === null || context === undefined) {
            console.warn('❌ CartContext is not available - component may be outside CartProvider');
            return getCartFallback();
        }
        
        return context;
    } catch (error) {
        console.error('❌ useCart error:', error);
        return getCartFallback();
    }
    
    // If context is null or undefined, use fallback
    if (context === null || context === undefined) {
        console.warn('❌ CartContext is not available - component may be outside CartProvider');
        return getCartFallback();
    }
    
    return context;
};

const getCartFallback = () => {
    // Return default values if React context is not available
    return {
        cartItems: [],
        loading: false,
        addToCart: () => Promise.resolve({ success: false }),
        removeFromCart: () => Promise.resolve(),
        updateQuantity: () => Promise.resolve(),
        clearCart: () => Promise.resolve(),
        getCartTotals: () => ({ itemCount: 0, subtotal: 0, shipping: 0, tax: 0, total: 0 }),
        isInCart: () => false,
        getItemQuantity: () => 0,
        loadCart: () => Promise.resolve(),
        mergeLocalCartToUserCart: () => Promise.resolve({ success: false, merged: 0 }),
        clearCartLocalStorage: () => {}
    };
};
