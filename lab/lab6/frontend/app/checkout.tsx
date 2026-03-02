import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { apiCall } from '../utils/api';

export default function Checkout() {
    // TODO: Define state variables (address, loading)
    const router = useRouter();

    const placeOrder = async () => {
        // TODO: Implement placeOrder
        // 1. Validate that all address fields are filled
        // 2. Call API '/place-order' with address data
        // 3. On success, show alert and navigate to home ('/(tabs)')
    };

    return (
        <SafeAreaView edges={['bottom', 'left', 'right']}>
            <Stack.Screen options={{ title: 'Checkout', headerShown: true, headerBackTitle: 'Back' }} />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView>
                    <Text>Shipping Address</Text>

                    {/* 
                        TODO: Implement Shipping Address Form 
                        1. Create TextInput for Street
                        2. Create TextInput for City
                        3. Create a Row with TextInputs for State and Pincode
                        4. Bind all inputs to the address state
                    */}
                    <View>
                        <Text>Implement Street Input</Text>
                    </View>
                    <View>
                        <Text>Implement City Input</Text>
                    </View>

                    {/* 
                        TODO: Implement Place Order Button
                        1. Create a TouchableOpacity
                        2. Call placeOrder on press
                        3. Disable button while loading
                        4. Show 'Placing Order...' text when loading
                    */}
                    <View>
                        <Text>Implement Place Order Button</Text>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

// TODO: Define styles
