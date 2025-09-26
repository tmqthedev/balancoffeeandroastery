// Constants and utility functions for CartContext
import { useContext } from 'react';
import { CartContext } from '../context/CartContext';

export { CartContext };

export const useCart = () => {
    try {
        // Check if we're in a React component context
        if (typeof useContext !== 'function') {
            console.warn('useCart called outside React component, using fallback');
            return getCartFallback();
        }
        
        const context = useContext(CartContext);
        
        // If context is null or undefined, use fallback
        if (context === null || context === undefined) {
            console.warn('CartContext is null or undefined, using fallback cart');
            return getCartFallback();
        }
        
        return context;
    } catch (error) {
        console.error('useCart hook error:', error);
        return getCartFallback();
    }
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
        mergeLocalCartToUserCart: () => Promise.resolve(),
        clearCartLocalStorage: () => {}
    };
};
