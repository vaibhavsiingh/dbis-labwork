import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

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
    const itemTotal = (item.price * item.quantity).toFixed(2);

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.price}>${item.price.toFixed(2)}</Text>
            </View>

            <View style={styles.bottomRow}>
                <View style={styles.quantityContainer}>
                    <TouchableOpacity
                        activeOpacity={0.8}
                        style={styles.qtyButton}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        onPress={() => onUpdateQuantity(item.id, Math.max(0, item.quantity - 1))}
                    >
                        <Text style={styles.qtyButtonText}>-</Text>
                    </TouchableOpacity>

                    <Text style={styles.qtyText}>{item.quantity}</Text>

                    <TouchableOpacity
                        activeOpacity={0.8}
                        style={styles.qtyButton}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        onPress={() => onUpdateQuantity(item.id, item.quantity + 1)}
                    >
                        <Text style={styles.qtyButtonText}>+</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.itemTotal}>Total: ${itemTotal}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        gap: 12,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    name: {
        flex: 1,
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
        marginRight: 10,
    },
    price: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1d4ed8',
    },
    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#eef2f7',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#d8e0ea',
        paddingVertical: 2,
    },
    qtyButton: {
        minWidth: 38,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
    },
    qtyButtonText: {
        fontSize: 20,
        fontWeight: '800',
        color: '#007AFF',
        lineHeight: 20,
    },
    qtyText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
        minWidth: 24,
        textAlign: 'center',
    },
    itemTotal: {
        fontSize: 14,
        color: '#4b5563',
        fontWeight: '600',
    },
});

export default CartItem;
