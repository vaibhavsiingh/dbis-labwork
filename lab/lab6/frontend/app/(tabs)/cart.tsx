import React, { useCallback, useState } from 'react';
import {
    View,
    Text,
    KeyboardAvoidingView,
    Platform,
    ListRenderItemInfo,
    ActivityIndicator,
    FlatList,
    TouchableOpacity,
    Alert,
    StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import CartItem from '../../components/CartItem';
import { apiCall } from '../../utils/api';

interface CartItemData {
    id: string;
    name: string;
    price: number;
    quantity: number;
}

export default function Cart() {
    const [cartItems, setCartItems] = useState<CartItemData[]>([]);
    const [totalPrice, setTotalPrice] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const router = useRouter();

    useFocusEffect(
        useCallback(() => {
            fetchCart();
        }, [])
    );

    const fetchCart = async () => {
        setLoading(true);
        try {
            const data = await apiCall('/display-cart');
            const mappedItems: CartItemData[] = (data.cart || []).map((item: any) => ({
                id: item.product_id.toString(),
                name: item.name,
                price: Number(item.price),
                quantity: Number(item.quantity),
            }));

            setCartItems(mappedItems);
            setTotalPrice(Number(data.totalPrice) || 0);
        } catch (error: any) {
            console.error(error);
            Alert.alert('Error', error.message || 'Failed to load cart');
            setCartItems([]);
            setTotalPrice(0);
        } finally {
            setLoading(false);
        }
    };

    // Function to handle quantity updates
    const handleUpdateQuantity = async (productId: string | number, newQuantity: number) => {
        // TODO: Implement handleUpdateQuantity logic
        // Hint: This involves calling the API and updating local state
        try {
            if (newQuantity <= 0) {
                await apiCall('/remove-from-cart', {
                    method: 'POST',
                    body: { product_id: Number(productId) },
                    silent: true,
                });
            } else {
                await apiCall('/update-cart', {
                    method: 'POST',
                    body: { product_id: Number(productId), quantity: newQuantity },
                    silent: true,
                });
            }

            const updatedItems =
                newQuantity <= 0
                    ? cartItems.filter((item) => item.id !== productId.toString())
                    : cartItems.map((item) =>
                        item.id === productId.toString()
                            ? { ...item, quantity: newQuantity }
                            : item
                    );

            setCartItems(updatedItems);

            const updatedTotal = updatedItems.reduce(
                (sum, item) => sum + item.price * item.quantity,
                0
            );
            setTotalPrice(updatedTotal);
        } catch (error: any) {
            console.error(error);
            Alert.alert('Error', error.message || 'Failed to update cart');
        }
    };

    const renderItem = ({ item }: ListRenderItemInfo<CartItemData>) => (
        <View style={styles.itemCard}>
            <CartItem item={item} onUpdateQuantity={handleUpdateQuantity} />
        </View>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    return (
        <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.container}
            >
                <View style={styles.header}>
                    <Text style={styles.title}>My Cart</Text>
                    <Text style={styles.subtitle}>{cartItems.length} item(s)</Text>
                </View>

                {cartItems.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <View style={styles.emptyBadge}>
                            <Text style={styles.emptyBadgeText}>CART</Text>
                        </View>
                        <Text style={styles.emptyTitle}>Your cart is empty</Text>
                        <Text style={styles.emptyText}>Add items from Products to continue.</Text>
                    </View>
                ) : (
                    <>
                        <FlatList
                            data={cartItems}
                            renderItem={renderItem}
                            keyExtractor={(item) => item.id}
                            contentContainerStyle={styles.list}
                        />

                        <View style={styles.footer}>
                            <View style={styles.totalRow}>
                                <Text style={styles.totalLabel}>Total Amount</Text>
                                <Text style={styles.totalText}>${totalPrice.toFixed(2)}</Text>
                            </View>
                            <TouchableOpacity
                                style={styles.checkoutButton}
                                onPress={() => router.push('/checkout')}
                            >
                                <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
                            </TouchableOpacity>
                        </View>
                    </>
                )}
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f2f4f8',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f2f4f8',
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 18,
        paddingBottom: 12,
    },
    title: {
        fontSize: 30,
        fontWeight: '800',
        color: '#111827',
    },
    subtitle: {
        marginTop: 2,
        fontSize: 14,
        color: '#6b7280',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    emptyBadge: {
        backgroundColor: '#e8eefc',
        borderRadius: 999,
        paddingHorizontal: 14,
        paddingVertical: 6,
        marginBottom: 12,
    },
    emptyBadgeText: {
        color: '#1d4ed8',
        fontWeight: '700',
        fontSize: 12,
        letterSpacing: 0.5,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 6,
    },
    emptyText: {
        fontSize: 15,
        color: '#6b7280',
        textAlign: 'center',
    },
    list: {
        paddingHorizontal: 20,
        paddingBottom: 14,
        gap: 12,
    },
    itemCard: {
        backgroundColor: '#ffffff',
        borderRadius: 14,
        padding: 14,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 2,
    },
    footer: {
        borderTopWidth: 1.5,
        borderTopColor: '#dfe5ec',
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        paddingTop: 14,
        paddingBottom: 18,
        gap: 12,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    totalLabel: {
        fontSize: 14,
        color: '#6b7280',
        fontWeight: '600',
    },
    totalText: {
        fontSize: 22,
        fontWeight: '800',
        color: '#111827',
    },
    checkoutButton: {
        backgroundColor: '#007AFF',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    checkoutButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
