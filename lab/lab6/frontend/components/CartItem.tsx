import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

// Define interfaces for CartItemData and CartItemProps
export interface CartItemData {
    id: string;
    name: string;
    price: number;
    quantity: number;
}

interface CartItemProps {
    item: CartItemData;
    onUpdateQuantity: (id: string, newQuantity: number) => void;
}

const CartItem = ({ item, onUpdateQuantity }: CartItemProps) => {
    // Calculate total for this item
    const itemTotal = (item.price * item.quantity).toFixed(2);

    return (
        <View>
            <View>
                <Text>{item.name}</Text>
                <Text>${item.price.toFixed(2)}</Text>
            </View>
            <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity 
                    onPress={() => onUpdateQuantity(item.id, Math.max(0, item.quantity - 1))}
                >
                    <Text> - </Text>
                </TouchableOpacity>

                <Text>{item.quantity}</Text>

                <TouchableOpacity 
                    onPress={() => onUpdateQuantity(item.id, item.quantity + 1)}
                >
                    <Text> + </Text>
                </TouchableOpacity>
            </View>
            <Text>Total: ${itemTotal}</Text>
        </View>
    );
};

export default CartItem;