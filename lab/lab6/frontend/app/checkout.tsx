import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { apiCall } from '../utils/api';

export default function Checkout() {
    // TODO: Define state variables (address, loading)
    const [address, setAddress] = useState({
        street: '',
        city: '',
        state: '',
        zip: '',
    });
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const updateAddress = (field: 'street' | 'city' | 'state' | 'zip', value: string) => {
        setAddress((prev) => ({ ...prev, [field]: value }));
    };

    const handleCancel = () => {
        router.back();
    };

    const placeOrder = async () => {
        // TODO: Implement placeOrder
        // 1. Validate that all address fields are filled
        // 2. Call API '/place-order' with address data
        // 3. On success, show alert and navigate to home ('/(tabs)')
        const street = address.street.trim();
        const city = address.city.trim();
        const state = address.state.trim();
        const zip = address.zip.trim();

        if (!street || !city || !state || !zip) {
            Alert.alert('Missing fields', 'Please fill in all address fields before placing the order.');
            return;
        }

        setLoading(true);
        try {
            await apiCall('/place-order', {
                method: 'POST',
                body: {
                    address: {
                        street,
                        city,
                        state,
                        pincode: zip,
                    },
                },
                silent: true,
            });

            Alert.alert('Order placed', 'Your order was placed successfully.', [
                {
                    text: 'OK',
                    onPress: () => router.replace('/(tabs)'),
                },
            ]);
        } catch (error: any) {
            console.error(error);
            Alert.alert('Error', error.message || 'Failed to place order');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.container}>
            <Stack.Screen options={{ title: 'Checkout', headerShown: true, headerBackTitle: 'Back' }} />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.container}
            >
                <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                    <Text style={styles.heading}>Shipping Address</Text>

                    {/* 
                        TODO: Implement Shipping Address Form 
                        1. Create TextInput for Street
                        2. Create TextInput for City
                        3. Create a Row with TextInputs for State and Pincode
                        4. Bind all inputs to the address state
                    */}
                    <View style={styles.inputBlock}>
                        <Text style={styles.label}>Street</Text>
                        <TextInput
                            value={address.street}
                            onChangeText={(value) => updateAddress('street', value)}
                            placeholder="Street"
                            style={styles.input}
                            autoCapitalize="words"
                        />
                    </View>
                    <View style={styles.inputBlock}>
                        <Text style={styles.label}>City</Text>
                        <TextInput
                            value={address.city}
                            onChangeText={(value) => updateAddress('city', value)}
                            placeholder="City"
                            style={styles.input}
                            autoCapitalize="words"
                        />
                    </View>
                    <View style={styles.row}>
                        <View style={[styles.inputBlock, styles.halfWidth]}>
                            <Text style={styles.label}>State</Text>
                            <TextInput
                                value={address.state}
                                onChangeText={(value) => updateAddress('state', value)}
                                placeholder="State"
                                style={styles.input}
                                autoCapitalize="characters"
                                maxLength={30}
                            />
                        </View>
                        <View style={[styles.inputBlock, styles.halfWidth]}>
                            <Text style={styles.label}>Pincode</Text>
                            <TextInput
                                value={address.zip}
                                onChangeText={(value) => updateAddress('zip', value)}
                                placeholder="Pincode"
                                style={styles.input}
                                keyboardType="number-pad"
                                maxLength={6}
                            />
                        </View>
                    </View>

                    {/* 
                        TODO: Implement Place Order Button
                        1. Create a TouchableOpacity
                        2. Call placeOrder on press
                        3. Disable button while loading
                        4. Show 'Placing Order...' text when loading
                    */}
                    <View style={styles.actionsContainer}>
                        <TouchableOpacity
                            style={[styles.placeOrderButton, loading && styles.disabledButton]}
                            onPress={placeOrder}
                            disabled={loading}
                        >
                            <Text style={styles.placeOrderButtonText}>{loading ? 'Placing Order...' : 'Place Order'}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={handleCancel}
                            disabled={loading}
                        >
                            <Text style={styles.cancelButtonText}>Back to Previous Screen</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

// TODO: Define styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f2f4f8',
    },
    content: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 24,
    },
    heading: {
        fontSize: 28,
        fontWeight: '800',
        color: '#111827',
        marginBottom: 16,
    },
    inputBlock: {
        marginBottom: 14,
    },
    label: {
        fontSize: 13,
        color: '#4b5563',
        marginBottom: 6,
        fontWeight: '600',
    },
    input: {
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 12,
        fontSize: 15,
        color: '#111827',
    },
    row: {
        flexDirection: 'row',
        gap: 10,
    },
    halfWidth: {
        flex: 1,
    },
    actionsContainer: {
        marginTop: 8,
        gap: 10,
    },
    placeOrderButton: {
        backgroundColor: '#007AFF',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
    },
    placeOrderButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '700',
    },
    disabledButton: {
        opacity: 0.65,
    },
    cancelButton: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#d1d5db',
    },
    cancelButtonText: {
        color: '#111827',
        fontSize: 15,
        fontWeight: '600',
    },
});
