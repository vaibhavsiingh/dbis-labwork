import React, { useCallback } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ListRenderItemInfo } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import CartItem from '../../components/CartItem';
import { apiCall } from '../../utils/api';

// TODO: Define CartItemData interface

export default function Cart() {
    // TODO: Define state variables (cartItems, totalPrice, loading)
    const router = useRouter();

    useFocusEffect(
        useCallback(() => {
            fetchCart();
        }, [])
    );

    const fetchCart = async () => {
        // TODO: Implement fetchCart logic
        // Hint: You'll need to use the apiCall utility and set state
    };

    // Function to handle quantity updates
    const handleUpdateQuantity = async (productId: string | number, newQuantity: number) => {
        // TODO: Implement handleUpdateQuantity logic
        // Hint: This involves calling the API and updating local state
    };

    const renderItem = ({ item }: ListRenderItemInfo<any>) => (
        <CartItem item={item} onUpdateQuantity={handleUpdateQuantity} />
    );

    //
    // if (loading) {
    //  TODO: Handle loading state (return ActivityIndicator)
    // }
    return (
        <SafeAreaView edges={['top', 'left', 'right']}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <Text>My Cart</Text>

                {/* 
                   TODO: Implement the Cart UI 
                   - Handle empty cart state
                   - Render list of items if cart is not empty
                   - Render footer with total price and checkout button
                */}
                <View style={{ padding: 20, alignItems: 'center' }}>
                    <Text>Implement Cart Screen</Text>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

// TODO: Define styles
