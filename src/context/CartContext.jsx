import React, { useState, useMemo, useEffect, useCallback, createContext } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

// Create the CartContext here instead of importing it
export const CartContext = createContext(null);

console.log('🛒 CartContext created:', CartContext);

// Configure axios for cart API
const API_BASE_URL = '/api';
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Re-export the useCart hook


export const CartProvider = ({ children }) => {
    console.log('🛒 CartProvider rendering with children:', !!children);
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    
    // Update authentication status
    const updateAuthStatus = useCallback(() => {
        const token = localStorage.getItem('authToken');
        const newIsAuthenticated = !!token;
        setIsAuthenticated(newIsAuthenticated);
        return newIsAuthenticated;
    }, []);

    // Utility function to clear all cart-related localStorage
    const clearCartLocalStorage = useCallback(() => {
        console.log('🧹 CartContext: Clearing all cart-related localStorage');
        localStorage.removeItem('cart');
        localStorage.removeItem('buyNowProduct');
    }, []);

    // Merge local cart to user cart when user logs in
    const mergeLocalCartToUserCart = useCallback(async () => {
        console.log('🔄 CartContext: mergeLocalCartToUserCart called');
        try {
            const localCart = localStorage.getItem('cart');
            if (!localCart) {
                console.log('❌ CartContext: No local cart to merge');
                return;
            }

            const localCartItems = JSON.parse(localCart);
            console.log('🔍 CartContext: Raw localStorage cart:', localCart);
            console.log('📦 CartContext: Parsed localStorage cart:', localCartItems);
            if (!localCartItems || localCartItems.length === 0) {
                console.log('❌ CartContext: Local cart is empty');
                // Still clear localStorage even if empty
                localStorage.removeItem('cart');
                console.log('🧹 CartContext: Cleared empty localStorage cart');
                return;
            }

            console.log('📦 CartContext: Merging local cart items:', localCartItems);

            // Add each item from local cart to user cart
            for (const item of localCartItems) {
                try {
                    const productId = item.product_id || item.id || item.productId;
                    console.log('🛒 CartContext: Processing item:', { 
                        item, 
                        extractedProductId: productId,
                        quantity: item.quantity,
                        variant: item.variant 
                    });
                    
                    const response = await api.post('/cart', {
                        productId: productId,
                        quantity: item.quantity,
                        variant: item.variant || {}
                    });
                    console.log('✅ CartContext: Item added successfully:', response.data);
                } catch (error) {
                    console.error('❌ CartContext: Failed to add item:', item, error);
                }
            }

            // Clear local cart after successful merge
            localStorage.removeItem('cart');
            console.log('🧹 CartContext: Local cart cleared after merge');
            
            // Reload cart to get the merged items
            await loadCart();
            console.log('🔄 CartContext: Cart reloaded after merge');

        } catch (error) {
            console.error('❌ CartContext: Failed to merge local cart:', error);
            // Clear localStorage even if merge fails to prevent future conflicts
            localStorage.removeItem('cart');
            console.log('🧹 CartContext: Local cart cleared after merge failure');
        }
    }, []);

    // Load cart from localStorage (guest) or API (authenticated user)
    const loadCart = useCallback(async () => {
        console.log('🔄 CartContext: loadCart called, isAuthenticated:', isAuthenticated);
        try {
            if (isAuthenticated) {
                console.log('🔐 CartContext: Loading cart from API');
                // Load from API for authenticated users
                const response = await api.get('/cart');
                console.log('📡 CartContext: Cart API response:', response.data);
                
                const cartData = response.data.cart || response.data;
                const cartItems = cartData.items || [];
                console.log('📦 CartContext: Cart items from API:', cartItems);
                
                // Transform backend cart items to frontend format
                const transformedItems = cartItems.map(item => ({
                    product_id: item.productId,
                    id: item.productId,
                    name: item.name || 'Sản phẩm',
                    price: item.price || 0,
                    quantity: item.quantity || 1,
                    variant: item.variant || {},
                    image_url: item.image_url || '',
                    description: item.description || ''
                }));
                console.log('🔄 CartContext: Transformed items:', transformedItems);
                
                setCartItems(transformedItems);
            } else {
                console.log('👤 CartContext: Loading cart from localStorage');
                // Load from localStorage for guests
                const savedCart = localStorage.getItem('cart');
                if (savedCart) {
                    const parsedCart = JSON.parse(savedCart);
                    console.log('📦 CartContext: Cart from localStorage:', parsedCart);
                    setCartItems(parsedCart);
                } else {
                    console.log('📦 CartContext: No cart in localStorage');
                }
            }
        } catch (error) {
            console.error('❌ CartContext: Failed to load cart:', error);
            // Fallback to localStorage for guests
            const savedCart = localStorage.getItem('cart');
            if (savedCart) {
                setCartItems(JSON.parse(savedCart));
            }
        }
    }, [isAuthenticated]);

    // Initialize authentication status and listen for changes
    useEffect(() => {
        updateAuthStatus();
        
        // Listen for storage changes (login/logout in other tabs)
        const handleStorageChange = (e) => {
            if (e.key === 'authToken') {
                updateAuthStatus();
            }
        };
        
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [updateAuthStatus]);

    // Clear localStorage on page unload for authenticated users
    useEffect(() => {
        const handleBeforeUnload = () => {
            // Only clear localStorage if user is authenticated
            // This prevents clearing guest cart when page is refreshed
            if (isAuthenticated) {
                console.log('🔄 CartContext: Page unloading, clearing localStorage for authenticated user');
                localStorage.removeItem('cart');
                localStorage.removeItem('buyNowProduct');
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [isAuthenticated]);

    // Load cart on mount and when authentication state changes
    useEffect(() => {
        console.log('🔄 CartContext: useEffect triggered, isAuthenticated:', isAuthenticated);
        
        const handleAuthenticationChange = async () => {
            // If user just became authenticated, merge local cart to user cart
            if (isAuthenticated) {
                console.log('🔐 CartContext: User is authenticated, checking for local cart to merge');
                const localCart = localStorage.getItem('cart');
                if (localCart) {
                    console.log('📦 CartContext: Found local cart, merging to user cart');
                    try {
                        await mergeLocalCartToUserCart();
                        console.log('✅ CartContext: Local cart merged successfully');
                    } catch (error) {
                        console.error('❌ CartContext: Failed to merge local cart:', error);
                    }
                } else {
                    console.log('❌ CartContext: No local cart to merge');
                }
            }
            
            // Always load cart after authentication check
            await loadCart();
        };
        
        handleAuthenticationChange();
    }, [isAuthenticated, loadCart, mergeLocalCartToUserCart]);

    // Add item to cart
    const addToCart = useCallback(async (product, quantity = 1) => {
        console.log('🛒 CartContext: addToCart called with:', { product, quantity, isAuthenticated });
        try {
            setLoading(true);
            const productId = product.product_id || product.id;
            console.log('🆔 CartContext: Product ID:', productId);
            
            if (isAuthenticated) {
                console.log('🔐 CartContext: User is authenticated, calling API');
                // For authenticated users, call API
                const variant = product.selectedWeight ? { weight: product.selectedWeight } : {};
                const response = await api.post('/cart', { 
                    productId: productId,
                    quantity: quantity,
                    variant: variant
                    // Remove price from request body - API gets it from Product model
                });
                console.log('📡 CartContext: API response:', response.data);
                
                if (response.data.success) {
                    console.log('✅ CartContext: API call successful, reloading cart');
                    // Clear localStorage cart when switching to API cart
                    localStorage.removeItem('cart');
                    console.log('🧹 CartContext: Cleared localStorage cart');
                    // Reload cart to get updated data with populated product info
                    await loadCart();
                    return { success: true };
                } else {
                    console.log('❌ CartContext: API call failed:', response.data);
                    throw new Error(response.data.error || 'Failed to add item to cart');
                }
            } else {
                console.log('👤 CartContext: User is not authenticated, handling locally');
                // For guests, handle locally
                const newItems = (() => {
                    const existingItem = cartItems.find(item => (item.product_id || item.id) === productId);
                    
                    if (existingItem) {
                        return cartItems.map(item =>
                            (item.product_id || item.id) === productId
                                ? { ...item, quantity: item.quantity + quantity }
                                : item
                        );
                    } else {
                        return [...cartItems, { 
                            ...product, 
                            quantity, 
                            product_id: productId,
                            id: productId 
                        }];
                    }
                })();
                
                setCartItems(newItems);
                localStorage.setItem('cart', JSON.stringify(newItems));
                console.log('✅ CartContext: Local cart updated:', newItems);
                return { success: true };
            }
        } catch (error) {
            console.error('❌ CartContext: Failed to add to cart:', error);
            throw error; // Re-throw so callers can handle it
        } finally {
            setLoading(false);
        }
    }, [cartItems, loadCart, isAuthenticated]);

    // Remove item from cart
    const removeFromCart = useCallback(async (productId) => {
        console.log('🗑️ CartContext: removeFromCart called with productId:', productId, 'isAuthenticated:', isAuthenticated);
        try {
            setLoading(true);
            
            if (isAuthenticated) {
                console.log('🔐 CartContext: Removing from API');
                // For authenticated users, call API
                try {
                    const response = await api.delete(`/cart/items/${productId}`);
                    console.log('📡 CartContext: Remove API response:', response);
                    if (response.data.success) {
                        console.log('✅ CartContext: Item removed successfully, reloading cart');
                        await loadCart(); // Reload cart from API
                        return { success: true };
                    } else {
                        console.log('❌ CartContext: API returned success=false:', response.data);
                        throw new Error(response.data.error || 'Failed to remove item');
                    }
                } catch (apiError) {
                    console.error('❌ CartContext: API call failed:', apiError);
                    
                    // Fallback: Remove from local state if API fails
                    console.log('🔄 CartContext: Falling back to local removal due to API error');
                    const newItems = cartItems.filter(item => (item.product_id || item.id) !== productId);
                    setCartItems(newItems);
                    
                    // Don't update localStorage for authenticated users unless explicitly needed
                    // This is just for immediate UI feedback
                    
                    throw apiError; // Still throw the original error for proper error handling
                }
            } else {
                console.log('👤 CartContext: Removing locally');
                // For guests, handle locally
                const newItems = cartItems.filter(item => (item.product_id || item.id) !== productId);
                setCartItems(newItems);
                localStorage.setItem('cart', JSON.stringify(newItems));
                console.log('✅ CartContext: Item removed locally');
                return { success: true };
            }
        } catch (error) {
            console.error('❌ CartContext: Failed to remove from cart:', error);
            console.error('❌ CartContext: Error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            // Re-throw the error so callers can handle it
            throw error;
        } finally {
            setLoading(false);
        }
    }, [cartItems, isAuthenticated, loadCart]);

    // Update item quantity
    const updateQuantity = useCallback(async (productId, quantity) => {
        try {
            setLoading(true);
            if (quantity <= 0) {
                await removeFromCart(productId);
                return;
            }
            
            if (isAuthenticated) {
                // For authenticated users, call API
                const response = await api.put(`/cart/items/${productId}`, { quantity });
                if (response.data.success) {
                    await loadCart(); // Reload cart from API
                }
            } else {
                // For guests, handle locally
                const newItems = cartItems.map(item =>
                    (item.product_id || item.id) === productId
                        ? { ...item, quantity }
                        : item
                );
                
                setCartItems(newItems);
                localStorage.setItem('cart', JSON.stringify(newItems));
            }
        } catch (error) {
            console.error('Failed to update quantity:', error);
        } finally {
            setLoading(false);
        }
    }, [cartItems, removeFromCart, isAuthenticated, loadCart]);

    // Clear cart
    const clearCart = useCallback(async () => {
        // Optimistically clear UI first so callers see immediate feedback
        setLoading(true);
        setCartItems([]);

        try {
            if (!isAuthenticated) {
                // Guests: persist empty cart locally
                localStorage.setItem('cart', JSON.stringify([]));
                return;
            }

            // Authenticated users: attempt to clear server-side cart, but keep UI cleared
            try {
                const response = await api.delete('/cart');
                if (!response || !response.data || !response.data.success) {
                    console.warn('Clear cart API returned non-success:', response && response.data);
                    // Attempt to reload server-side cart to reflect real state
                    await loadCart();
                }
            } catch (err) {
                console.error('Failed to clear cart via API:', err);
                // Try to reload to recover state from server
                try { await loadCart(); } catch { /* swallow */ }
            }
        } catch (error) {
            console.error('Failed to clear cart:', error);
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, loadCart]);

    // Get cart totals
    const getCartTotals = useCallback(() => {
        const itemCount = cartItems.reduce((total, item) => total + (Number(item.quantity) || 0), 0);
        const subtotal = cartItems.reduce((total, item) => {
            const price = Number(item.price) || 0; // Price is already in VND
            const quantity = Number(item.quantity) || 0;
            return total + (price * quantity);
        }, 0);
        
        // No shipping or tax charges
        const shipping = 0;
        const tax = 0;
        const total = subtotal;
        
        return { 
            itemCount: itemCount || 0, 
            subtotal: subtotal || 0,
            shipping: shipping || 0, 
            tax: tax || 0, 
            total: total || 0
        };
    }, [cartItems]);

    // Check if product is in cart
    const isInCart = useCallback((productId) => {
        return cartItems.some(item => (item.product_id || item.id) === productId);
    }, [cartItems]);

    // Get quantity of specific item in cart
    const getItemQuantity = useCallback((productId) => {
        const item = cartItems.find(item => (item.product_id || item.id) === productId);
        return item ? item.quantity : 0;
    }, [cartItems]);

    const value = useMemo(() => ({
        cartItems,
        loading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotals,
        isInCart,
        getItemQuantity,
        loadCart,
        mergeLocalCartToUserCart,
        clearCartLocalStorage
    }), [cartItems, loading, addToCart, removeFromCart, updateQuantity, clearCart, getCartTotals, isInCart, getItemQuantity, loadCart, mergeLocalCartToUserCart, clearCartLocalStorage]);

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};

CartProvider.propTypes = {
    children: PropTypes.node.isRequired,
};
