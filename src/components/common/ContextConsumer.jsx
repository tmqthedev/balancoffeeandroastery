import React from 'react';
import { AuthContext } from '../../context/AuthContext';
import { CartContext } from '../../context/CartContext';

// Safe context consumer component using Consumer pattern
const ContextConsumer = ({ children }) => {
    return (
        <AuthContext.Consumer>
            {(authContext) => (
                <CartContext.Consumer>
                    {(cartContext) => {
                        // Provide fallback values if contexts are null
                        const auth = authContext || {
                            user: null,
                            loading: false,
                            isAuthenticated: false,
                            login: () => Promise.resolve({ success: false }),
                            loginWithToken: () => Promise.resolve({ success: false }),
                            logout: () => {
                                localStorage.removeItem('authToken');
                                localStorage.removeItem('userData');
                                window.location.reload();
                            },
                            register: () => Promise.resolve({ success: false }),
                            updateUserInfo: () => Promise.resolve({ success: false }),
                            changePassword: () => Promise.resolve({ success: false }),
                            checkAuthStatus: () => {},
                            refreshUser: () => Promise.resolve(null)
                        };

                        const cart = cartContext || {
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
                        
                        return children({ auth, cart });
                    }}
                </CartContext.Consumer>
            )}
        </AuthContext.Consumer>
    );
};

export default ContextConsumer;