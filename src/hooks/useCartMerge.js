import { useCallback } from 'react';
import { useAuth } from '../constants/authConstants';
import { useCart } from '../constants/cartConstants';

/**
 * Custom hook to handle cart merge after authentication (login/register)
 * This ensures that items in localStorage cart are merged to user cart after authentication
 */
export const useCartMerge = () => {
    // Get context values with safe fallbacks
    const auth = useAuth();
    const cart = useCart();
    
    const { isAuthenticated } = auth || { isAuthenticated: false };
    const { mergeLocalCartToUserCart } = cart || { mergeLocalCartToUserCart: null };

    /**
     * Force merge local cart to user cart
     * Should be called after successful registration when user becomes authenticated
     */
    const forceCartMerge = useCallback(async () => {
        console.log('🔄 useCartMerge: forceCartMerge called, isAuthenticated:', isAuthenticated);
        
        if (!isAuthenticated) {
            console.log('❌ useCartMerge: User not authenticated, cannot merge cart');
            return { success: false, error: 'User not authenticated' };
        }

        if (!mergeLocalCartToUserCart) {
            console.log('❌ useCartMerge: mergeLocalCartToUserCart not available');
            return { success: false, error: 'Cart merge function not available' };
        }

        try {
            console.log('🔄 useCartMerge: Starting cart merge...');
            const result = await mergeLocalCartToUserCart(true);
            console.log('✅ useCartMerge: Cart merge completed:', result);
            return result;
        } catch (error) {
            console.error('❌ useCartMerge: Cart merge failed:', error);
            return { success: false, error: error.message };
        }
    }, [isAuthenticated, mergeLocalCartToUserCart]);

    /**
     * Check if local cart exists and needs to be merged
     */
    const hasLocalCart = useCallback(() => {
        const localCart = localStorage.getItem('cart');
        if (!localCart) return false;
        
        try {
            const cartItems = JSON.parse(localCart);
            return Array.isArray(cartItems) && cartItems.length > 0;
        } catch (error) {
            console.error('❌ useCartMerge: Error parsing local cart:', error);
            return false;
        }
    }, []);

    return {
        forceCartMerge,
        hasLocalCart
    };
};

export default useCartMerge;