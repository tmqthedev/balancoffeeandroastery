import React from 'react';
import { useCart } from '../context/CartContext';

// Simple test component to verify CartContext functions
const CartTest = () => {
    const { isInCart, getItemQuantity, addToCart, cartItems } = useCart();
    
    console.log('CartContext functions available:');
    console.log('isInCart:', typeof isInCart);
    console.log('getItemQuantity:', typeof getItemQuantity);
    console.log('addToCart:', typeof addToCart);
    console.log('cartItems:', cartItems?.length || 0);
    
    return (
        <div>
            <h3>Cart Context Test</h3>
            <p>isInCart function: {typeof isInCart}</p>
            <p>getItemQuantity function: {typeof getItemQuantity}</p>
            <p>addToCart function: {typeof addToCart}</p>
            <p>Cart items: {cartItems?.length || 0}</p>
        </div>
    );
};

export default CartTest;
