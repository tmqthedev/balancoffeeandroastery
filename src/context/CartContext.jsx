import React, { createContext, useState, useMemo, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

// Create CartContext directly
export const CartContext = createContext(null);

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

    // Merge local cart to user cart when user logs in
    const mergeLocalCartToUserCart = useCallback(async (forceReload = false) => {
        console.log('🔄 CartContext: mergeLocalCartToUserCart called, forceReload:', forceReload);
        
        // Double-check authentication status
        const token = localStorage.getItem('authToken');
        if (!token) {
            console.log('❌ CartContext: No auth token found, cannot merge cart');
            return { success: false, merged: 0, error: 'User not authenticated' };
        }
        
        try {
            const localCart = localStorage.getItem('cart');
            if (!localCart) {
                console.log('❌ CartContext: No local cart to merge');
                if (forceReload) {
                    await loadCart();
                }
                return { success: true, merged: 0 };
            }

            let localCartItems;
            try {
                localCartItems = JSON.parse(localCart);
                console.log('🔍 CartContext: Raw localStorage cart:', localCart);
                console.log('📦 CartContext: Parsed localStorage cart:', localCartItems);
            } catch (parseError) {
                console.error('❌ CartContext: Failed to parse local cart JSON:', parseError);
                localStorage.removeItem('cart');
                console.log('🧹 CartContext: Cleared corrupted localStorage cart');
                if (forceReload) {
                    await loadCart();
                }
                return { success: false, merged: 0, error: 'Local cart data corrupted' };
            }
            
            if (!Array.isArray(localCartItems) || localCartItems.length === 0) {
                console.log('❌ CartContext: Local cart is empty or invalid');
                localStorage.removeItem('cart');
                console.log('🧹 CartContext: Cleared empty/invalid localStorage cart');
                if (forceReload) {
                    await loadCart();
                }
                return { success: true, merged: 0 };
            }

            console.log('📦 CartContext: Merging', localCartItems.length, 'local cart items');

            let mergedCount = 0;
            let failedCount = 0;
            const errors = [];
            
            // Add each item from local cart to user cart
            for (const [index, item] of localCartItems.entries()) {
                try {
                    const productId = item.product_id || item.id || item.productId;
                    
                    if (!productId) {
                        console.warn('⚠️ CartContext: Item missing productId, skipping:', item);
                        failedCount++;
                        errors.push(`Item ${index + 1}: Missing product ID`);
                        continue;
                    }
                    
                    if (!item.quantity || item.quantity <= 0) {
                        console.warn('⚠️ CartContext: Item has invalid quantity, skipping:', item);
                        failedCount++;
                        errors.push(`Item ${index + 1}: Invalid quantity`);
                        continue;
                    }
                    
                    console.log('🛒 CartContext: Processing item', index + 1, ':', { 
                        productId,
                        quantity: item.quantity,
                        variant: item.variant 
                    });
                    
                    const response = await api.post('/cart', {
                        productId: productId,
                        quantity: item.quantity,
                        variant: item.variant || {}
                    });
                    
                    if (response.data && response.data.success) {
                        console.log('✅ CartContext: Item', index + 1, 'added successfully');
                        mergedCount++;
                    } else {
                        console.error('❌ CartContext: API returned success=false for item', index + 1, ':', response.data);
                        failedCount++;
                        errors.push(`Item ${index + 1}: ${response.data?.error || 'Unknown API error'}`);
                    }
                } catch (itemError) {
                    console.error('❌ CartContext: Failed to add item', index + 1, ':', item, itemError);
                    failedCount++;
                    
                    if (itemError.response?.status === 401) {
                        errors.push(`Item ${index + 1}: Authentication failed`);
                        // If we get 401, user might have been logged out
                        console.error('❌ CartContext: Authentication failed during merge, stopping process');
                        break;
                    } else if (itemError.response?.status === 404) {
                        errors.push(`Item ${index + 1}: Product not found`);
                    } else {
                        errors.push(`Item ${index + 1}: ${itemError.response?.data?.error || itemError.message}`);
                    }
                }
                
                // Add small delay between requests to avoid overwhelming the server
                if (index < localCartItems.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 50));
                }
            }

            console.log('📊 CartContext: Merge summary - merged:', mergedCount, 'failed:', failedCount);

            // Clear local cart after merge attempt (regardless of success/failure)
            localStorage.removeItem('cart');
            console.log('🧹 CartContext: Local cart cleared after merge');
            
            // Reload cart to get the merged items
            try {
                await loadCart();
                console.log('🔄 CartContext: Cart reloaded after merge');
            } catch (loadError) {
                console.error('❌ CartContext: Failed to reload cart after merge:', loadError);
            }

            const result = {
                success: mergedCount > 0 || (mergedCount === 0 && failedCount === 0),
                merged: mergedCount,
                failed: failedCount,
                errors: errors.length > 0 ? errors : undefined
            };
            
            console.log('📋 CartContext: Final merge result:', result);
            return result;

        } catch (error) {
            console.error('❌ CartContext: Failed to merge local cart:', error);
            
            // Clear localStorage even if merge fails to prevent future conflicts
            localStorage.removeItem('cart');
            console.log('🧹 CartContext: Local cart cleared after merge failure');
            
            // Try to reload cart anyway
            try {
                await loadCart();
            } catch (loadError) {
                console.error('❌ CartContext: Failed to reload cart after merge error:', loadError);
            }
            
            return { 
                success: false, 
                merged: 0, 
                failed: 1,
                error: error.message || 'Cart merge failed' 
            };
        }
    }, [loadCart]);

    // Initialize authentication status and listen for changes
    useEffect(() => {
        updateAuthStatus();
        
        // Listen for storage changes (login/logout in other tabs)
        const handleStorageChange = (e) => {
            if (e.key === 'authToken') {
                console.log('🔄 CartContext: Storage event detected, updating auth status');
                const wasAuthenticated = isAuthenticated;
                const newIsAuthenticated = updateAuthStatus();
                
                // If user just became authenticated, force cart merge
                if (!wasAuthenticated && newIsAuthenticated) {
                    console.log('🔐 CartContext: User just authenticated via storage event, checking for local cart');
                    setTimeout(async () => {
                        const localCart = localStorage.getItem('cart');
                        if (localCart) {
                            console.log('📦 CartContext: Found local cart, merging...');
                            try {
                                await mergeLocalCartToUserCart(true);
                                console.log('✅ CartContext: Cart merge completed via storage event');
                            } catch (error) {
                                console.error('❌ CartContext: Cart merge failed via storage event:', error);
                            }
                        }
                    }, 100);
                }
            }
        };
        
        // Listen for custom auth events
        const handleAuthLoginComplete = async () => {
            console.log('🔄 CartContext: Auth login complete event detected');
            setTimeout(async () => {
                const newIsAuthenticated = updateAuthStatus();
                if (newIsAuthenticated) {
                    const localCart = localStorage.getItem('cart');
                    if (localCart) {
                        console.log('📦 CartContext: Found local cart after login complete, merging...');
                        try {
                            await mergeLocalCartToUserCart(true);
                            console.log('✅ CartContext: Cart merge completed after login');
                        } catch (error) {
                            console.error('❌ CartContext: Cart merge failed after login:', error);
                        }
                    }
                }
            }, 50);
        };
        
        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('auth-login-complete', handleAuthLoginComplete);
        
        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('auth-login-complete', handleAuthLoginComplete);
        };
    }, [updateAuthStatus, isAuthenticated, mergeLocalCartToUserCart]);

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
        console.log('🔄 CartContext: Current token exists:', !!localStorage.getItem('authToken'));
        
        const handleAuthenticationChange = async () => {
            console.log('🔄 CartContext: handleAuthenticationChange started');
            
            // If user just became authenticated, merge local cart to user cart
            if (isAuthenticated) {
                console.log('🔐 CartContext: User is authenticated, checking for local cart to merge');
                const localCart = localStorage.getItem('cart');
                console.log('📦 CartContext: Local cart exists:', !!localCart);
                
                if (localCart) {
                    console.log('📦 CartContext: Local cart content preview:', localCart.substring(0, 100) + '...');
                    console.log('📦 CartContext: Starting merge process to user cart');
                    
                    try {
                        const mergeResult = await mergeLocalCartToUserCart();
                        console.log('✅ CartContext: Local cart merge completed with result:', mergeResult);
                        
                        if (mergeResult.success && mergeResult.merged > 0) {
                            console.log('🎉 CartContext: Successfully merged', mergeResult.merged, 'items');
                        } else if (mergeResult.failed > 0) {
                            console.warn('⚠️ CartContext: Merge completed with', mergeResult.failed, 'failures');
                        }
                    } catch (error) {
                        console.error('❌ CartContext: Failed to merge local cart:', error);
                        console.error('❌ CartContext: Error details:', {
                            name: error.name,
                            message: error.message,
                            stack: error.stack
                        });
                    }
                } else {
                    console.log('❌ CartContext: No local cart to merge');
                }
            } else {
                console.log('👤 CartContext: User not authenticated, skipping merge');
            }
            
            // Always load cart after authentication check
            console.log('🔄 CartContext: Loading cart...');
            try {
                await loadCart();
                console.log('✅ CartContext: Cart loaded successfully');
            } catch (loadError) {
                console.error('❌ CartContext: Failed to load cart:', loadError);
            }
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
                // For guests, handle locally with proper variant support
                const productVariant = product.selectedWeight ? { weight: product.selectedWeight } : {};
                
                const newItems = (() => {
                    // Find existing item with same productId AND same variant
                    const existingItem = cartItems.find(item => {
                        const isSameProduct = (item.product_id || item.id) === productId;
                        const isSameVariant = JSON.stringify(item.variant || {}) === JSON.stringify(productVariant);
                        return isSameProduct && isSameVariant;
                    });
                    
                    if (existingItem) {
                        // Update quantity of existing item
                        return cartItems.map(item => {
                            const isSameProduct = (item.product_id || item.id) === productId;
                            const isSameVariant = JSON.stringify(item.variant || {}) === JSON.stringify(productVariant);
                            
                            if (isSameProduct && isSameVariant) {
                                return { ...item, quantity: item.quantity + quantity };
                            }
                            return item;
                        });
                    } else {
                        // Add new item with variant
                        return [...cartItems, { 
                            ...product, 
                            quantity, 
                            product_id: productId,
                            id: productId,
                            variant: productVariant
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
    const removeFromCart = useCallback(async (productId, variant = {}) => {
        console.log('🗑️ CartContext: removeFromCart called with productId:', productId, 'variant:', variant, 'isAuthenticated:', isAuthenticated);
        try {
            setLoading(true);
            
            if (isAuthenticated) {
                console.log('🔐 CartContext: Removing from API');
                // For authenticated users, call API
                try {
                    // Use axios config to send data in DELETE request
                    const response = await api.request({
                        method: 'DELETE',
                        url: `/cart/items/${productId}`,
                        data: { variant: variant || {} }
                    });
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
                    
                    // If 401, user might not be properly authenticated - fallback to local
                    if (apiError.response?.status === 401) {
                        console.log('🔐 CartContext: 401 Unauthorized - treating as guest user');
                    }
                    
                    // Fallback: Remove from local state if API fails with variant matching
                    console.log('🔄 CartContext: Falling back to local removal due to API error');
                    const newItems = cartItems.filter(item => {
                        const isSameProduct = (item.product_id || item.id) === productId;
                        const isSameVariant = JSON.stringify(item.variant || {}) === JSON.stringify(variant || {});
                        // Remove item if it matches both product and variant
                        return !(isSameProduct && isSameVariant);
                    });
                    
                    setCartItems(newItems);
                    localStorage.setItem('cart', JSON.stringify(newItems));
                    console.log('✅ CartContext: Local fallback removal successful');
                    
                    // Don't throw error for cart operations - just show a warning
                    console.warn('⚠️ CartContext: Removed locally, but server sync failed');
                    return { success: true }; // Return success since local operation worked
                }
            } else {
                console.log('👤 CartContext: Removing locally');
                // For guests, handle locally with variant matching
                const newItems = cartItems.filter(item => {
                    const isSameProduct = (item.product_id || item.id) === productId;
                    const isSameVariant = JSON.stringify(item.variant || {}) === JSON.stringify(variant || {});
                    // Remove item if it matches both product and variant
                    return !(isSameProduct && isSameVariant);
                });
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
    const updateQuantity = useCallback(async (productId, quantity, variant = {}) => {
        console.log('🔄 CartContext: updateQuantity called with:', { productId, quantity, variant, isAuthenticated });
        try {
            setLoading(true);
            
            if (quantity <= 0) {
                console.log('⚠️ CartContext: Quantity <= 0, calling removeFromCart');
                await removeFromCart(productId, variant);
                return;
            }
            
            if (isAuthenticated) {
                console.log('🔐 CartContext: Updating quantity via API');
                console.log('🔑 CartContext: Auth token:', localStorage.getItem('authToken') ? 'exists' : 'missing');
                console.log('👤 CartContext: isAuthenticated:', isAuthenticated);
                
                // For authenticated users, call API
                try {
                    const response = await api.put(`/cart/items/${productId}`, { 
                        quantity,
                        variant: variant || {}
                    });
                    console.log('📡 CartContext: Update quantity API response:', response.data);
                    
                    if (response.data && response.data.success) {
                        console.log('✅ CartContext: API update successful, reloading cart');
                        await loadCart(); // Reload cart from API
                    } else {
                        console.error('❌ CartContext: API returned success=false:', response.data);
                        throw new Error(response.data?.error || 'Failed to update quantity');
                    }
                } catch (apiError) {
                    console.error('❌ CartContext: API call failed:', apiError);
                    
                    // If 401, user might not be properly authenticated - fallback to local
                    if (apiError.response?.status === 401) {
                        console.log('🔐 CartContext: 401 Unauthorized - treating as guest user');
                    }
                    
                    // Fallback to local update for immediate feedback with variant matching
                    console.log('🔄 CartContext: Falling back to local update');
                    const newItems = cartItems.map(item => {
                        const isSameProduct = (item.product_id || item.id) === productId;
                        const isSameVariant = JSON.stringify(item.variant || {}) === JSON.stringify(variant || {});
                        
                        if (isSameProduct && isSameVariant) {
                            return { ...item, quantity };
                        }
                        return item;
                    });
                    
                    setCartItems(newItems);
                    localStorage.setItem('cart', JSON.stringify(newItems));
                    console.log('✅ CartContext: Local fallback update successful');
                    
                    // Don't throw error for cart updates - just show a warning
                    console.warn('⚠️ CartContext: Updated locally, but server sync failed');
                    return; // Exit early, don't re-throw
                }
            } else {
                console.log('👤 CartContext: Updating quantity locally');
                // For guests, handle locally with variant matching
                const newItems = cartItems.map(item => {
                    // Match by productId and variant
                    const isSameProduct = (item.product_id || item.id) === productId;
                    const isSameVariant = JSON.stringify(item.variant || {}) === JSON.stringify(variant || {});
                    
                    if (isSameProduct && isSameVariant) {
                        return { ...item, quantity };
                    }
                    return item;
                });
                
                setCartItems(newItems);
                localStorage.setItem('cart', JSON.stringify(newItems));
                console.log('✅ CartContext: Local quantity updated');
            }
        } catch (error) {
            console.error('❌ CartContext: Failed to update quantity:', error);
            throw error; // Re-throw so callers can handle it
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
