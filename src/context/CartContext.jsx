import React, { useState, useMemo, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { CartContext } from '../constants/cartConstants';
import { useAuth } from './AuthContext';

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
export { useCart } from '../constants/cartConstants';

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const { isAuthenticated } = useAuth();

    // Load cart from localStorage (guest) or API (authenticated user)
    const loadCart = useCallback(async () => {
        try {
            if (isAuthenticated) {
                // Load from API for authenticated users
                const response = await api.get('/cart');
                console.log('Cart API response:', response.data); // Debug log
                const cartData = response.data.cart || response.data;
                const cartItems = cartData.items || [];
                
                // Transform backend cart items to frontend format
                const transformedItems = cartItems.map(item => ({
                    product_id: item.productId,
                    id: item.productId,
                    name: item.name || 'Sản phẩm',
                    price: item.price || 0,
                    quantity: item.quantity || 1,
                    image_url: item.image_url || '',
                    description: item.description || ''
                }));
                
                setCartItems(transformedItems);
            } else {
                // Load from localStorage for guests
                const savedCart = localStorage.getItem('cart');
                if (savedCart) {
                    setCartItems(JSON.parse(savedCart));
                }
            }        } catch (error) {
            console.error('Failed to load cart:', error);
            // Fallback to localStorage for guests
            const savedCart = localStorage.getItem('cart');
            if (savedCart) {
                setCartItems(JSON.parse(savedCart));
            }        }
    }, [isAuthenticated]);

    // Load cart on mount
    useEffect(() => {
        loadCart();
    }, [loadCart, isAuthenticated]);

    // Add item to cart
    const addToCart = useCallback(async (product, quantity = 1) => {
        try {
            setLoading(true);
            const productId = product.product_id || product.id;
            
            if (isAuthenticated) {
                // For authenticated users, call API
                const response = await api.post('/cart', { 
                    productId: productId,
                    quantity: quantity 
                });
                
                if (response.data.success) {
                    // Reload cart to get updated data with populated product info
                    await loadCart();
                }
            } else {
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
            }
        } catch (error) {
            console.error('Failed to add to cart:', error);        } finally {
            setLoading(false);
        }
    }, [cartItems, isAuthenticated, loadCart]);

    // Remove item from cart
    const removeFromCart = useCallback(async (productId) => {
        try {
            setLoading(true);
            
            if (isAuthenticated) {
                // For authenticated users, call API
                const response = await api.delete(`/cart/items/${productId}`);
                if (response.data.success) {
                    await loadCart(); // Reload cart from API
                }
            } else {
                // For guests, handle locally
                const newItems = cartItems.filter(item => (item.product_id || item.id) !== productId);
                setCartItems(newItems);
                localStorage.setItem('cart', JSON.stringify(newItems));
            }
        } catch (error) {
            console.error('Failed to remove from cart:', error);        } finally {
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
        try {
            setLoading(true);
            
            if (isAuthenticated) {
                // For authenticated users, call API
                const response = await api.delete('/cart');
                if (response.data.success) {
                    setCartItems([]);
                }
            } else {
                // For guests, handle locally
                setCartItems([]);
                localStorage.setItem('cart', JSON.stringify([]));
            }
        } catch (error) {
            console.error('Failed to clear cart:', error);
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated]);

    // Get cart totals
    const getCartTotals = useCallback(() => {
        const itemCount = cartItems.reduce((total, item) => total + (Number(item.quantity) || 0), 0);
        const subtotal = cartItems.reduce((total, item) => {
            const price = Number(item.price) || 0; // Price is already in VND
            const quantity = Number(item.quantity) || 0;
            return total + (price * quantity);
        }, 0);
        
        const shipping = subtotal >= 1000000 ? 0 : 50000; // Free shipping over 1M VND
        const tax = Math.round(subtotal * 0.1); // 10% tax
        const total = subtotal + shipping + tax;
        
        return { 
            itemCount: itemCount || 0, 
            subtotal: subtotal || 0,            shipping: shipping || 0, 
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
        addToCart,        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotals,
        isInCart,
        getItemQuantity,
        loadCart
    }), [cartItems, loading, addToCart, removeFromCart, updateQuantity, clearCart, getCartTotals, isInCart, getItemQuantity, loadCart]);

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};

CartProvider.propTypes = {
    children: PropTypes.node.isRequired,
};
