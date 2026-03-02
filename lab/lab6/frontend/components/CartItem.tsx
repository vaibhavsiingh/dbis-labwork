import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

// TODO: Define interfaces for CartItemData and CartItemProps

const CartItem = ({ item, onUpdateQuantity }: any) => {
    return (
        <View>
            {/* 
                TODO: Implement the CartItem UI
                
                Hints:
                1. Define and use styles (card, itemInfo, productName, etc.)
                2. Display product name and price
                3. Create a quantity control section with '-' and '+' buttons
                4. Use the onUpdateQuantity prop to handle quantity changes
                   - Decrease: Math.max(0, item.quantity - 1)
                   - Increase: item.quantity + 1
                5. Display the total for this item (price * quantity)
                   - Use toFixed(2) for formatting
            */}
            <Text>Implement CartItem here</Text>
        </View>
    );
};

// TODO: Define styles

export default CartItem;
