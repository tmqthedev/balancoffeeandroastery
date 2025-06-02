import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import { useAuth } from './authConstants';
import { CartContext } from './cartConstants';

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const { isAuthenticated } = useAuth();    // Load cart on authentication change
    useEffect(() => {
        if (isAuthenticated) {
            loadCartFromServer();
        } else {
            loadCartFromLocalStorage();
        }
    }, [isAuthenticated, loadCartFromServer, loadCartFromLocalStorage]);// Load cart from server for authenticated users
    const loadCartFromServer = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/users/cart');
            if (response.data.success) {
                setCartItems(response.data.cartItems);
            }
        } catch (error) {
            console.error('Failed to load cart from server:', error);
            // Fallback to local storage
            loadCartFromLocalStorage();
        } finally {
            setLoading(false);
        }
    }, [loadCartFromLocalStorage]);// Load cart from localStorage for guest users
    const loadCartFromLocalStorage = useCallback(() => {
        try {
            const savedCart = localStorage.getItem('cartItems');
            if (savedCart) {
                setCartItems(JSON.parse(savedCart));
            }
        } catch (error) {
            console.error('Failed to load cart from localStorage:', error);
            setCartItems([]);
        }
    }, []);

    // Save cart to localStorage for guest users
    const saveCartToLocalStorage = (items) => {
        if (!isAuthenticated) {
            localStorage.setItem('cartItems', JSON.stringify(items));
        }
    };

    // Add item to cart
    const addToCart = async (product, quantity = 1) => {
        try {
            if (isAuthenticated) {
                // Add to server cart
                const response = await axios.post('/api/users/cart', {
                    productId: product.product_id,
                    quantity
                });

                if (response.data.success) {
                    setCartItems(response.data.cartItems);
                    return { success: true };
                } else {
                    return { success: false, message: response.data.message };
                }
            } else {
                // Add to local cart
                const existingItem = cartItems.find(item => item.product_id === product.product_id);
                let newCartItems;

                if (existingItem) {
                    newCartItems = cartItems.map(item =>
                        item.product_id === product.product_id
                            ? { ...item, quantity: item.quantity + quantity }
                            : item
                    );
                } else {
                    newCartItems = [...cartItems, { ...product, quantity }];
                }

                setCartItems(newCartItems);
                saveCartToLocalStorage(newCartItems);
                return { success: true };
            }
        } catch (error) {
            console.error('Failed to add item to cart:', error);
            return { success: false, message: 'Failed to add item to cart' };
        }
    };

    // Update item quantity
    const updateQuantity = async (productId, quantity) => {
        try {
            if (quantity <= 0) {
                return removeFromCart(productId);
            }

            if (isAuthenticated) {
                // Update on server
                const response = await axios.put('/api/users/cart', {
                    productId,
                    quantity
                });

                if (response.data.success) {
                    setCartItems(response.data.cartItems);
                    return { success: true };
                } else {
                    return { success: false, message: response.data.message };
                }
            } else {
                // Update local cart
                const newCartItems = cartItems.map(item =>
                    item.product_id === productId
                        ? { ...item, quantity }
                        : item
                );

                setCartItems(newCartItems);
                saveCartToLocalStorage(newCartItems);
                return { success: true };
            }
        } catch (error) {
            console.error('Failed to update quantity:', error);
            return { success: false, message: 'Failed to update quantity' };
        }
    };

    // Remove item from cart
    const removeFromCart = async (productId) => {
        try {
            if (isAuthenticated) {
                // Remove from server
                const response = await axios.delete(`/api/users/cart/${productId}`);

                if (response.data.success) {
                    setCartItems(response.data.cartItems);
                    return { success: true };
                } else {
                    return { success: false, message: response.data.message };
                }
            } else {
                // Remove from local cart
                const newCartItems = cartItems.filter(item => item.product_id !== productId);
                setCartItems(newCartItems);
                saveCartToLocalStorage(newCartItems);
                return { success: true };
            }
        } catch (error) {
            console.error('Failed to remove item from cart:', error);
            return { success: false, message: 'Failed to remove item from cart' };
        }
    };

    // Clear entire cart
    const clearCart = async () => {
        try {
            if (isAuthenticated) {
                await axios.delete('/api/users/cart');
            } else {
                localStorage.removeItem('cartItems');
            }
            setCartItems([]);
            return { success: true };
        } catch (error) {
            console.error('Failed to clear cart:', error);
            return { success: false, message: 'Failed to clear cart' };
        }
    };

    // Get cart totals
    const getCartTotals = () => {
        const subtotal = cartItems.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);

        const itemCount = cartItems.reduce((total, item) => {
            return total + item.quantity;
        }, 0);

        return {
            subtotal,
            itemCount,
            items: cartItems.length
        };
    };

    // Check if item is in cart
    const isInCart = (productId) => {
        return cartItems.some(item => item.product_id === productId);
    };

    // Get item quantity in cart
    const getItemQuantity = (productId) => {
        const item = cartItems.find(item => item.product_id === productId);
        return item ? item.quantity : 0;
    };

    // Sync local cart with server when user logs in
    const syncCartWithServer = async () => {
        if (!isAuthenticated || cartItems.length === 0) return;

        try {
            for (const item of cartItems) {
                await axios.post('/api/users/cart', {
                    productId: item.product_id,
                    quantity: item.quantity
                });
            }
            
            // Reload cart from server to get updated data
            await loadCartFromServer();
            
            // Clear local storage
            localStorage.removeItem('cartItems');
        } catch (error) {
            console.error('Failed to sync cart with server:', error);
        }
    };

    const value = {
        cartItems,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        getCartTotals,
        isInCart,
        getItemQuantity,
        syncCartWithServer
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};

CartProvider.propTypes = {
    children: PropTypes.node.isRequired
};
