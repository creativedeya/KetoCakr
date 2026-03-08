// ===========================================================
// FILE: mobile/app/(auth)/signin.tsx
// STEP 3: Sign in screen
// ===========================================================
import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const X = (props: any) => <Ionicons name="close" {...props} />;
import { useAuthStore } from '../../store/useAuthStore';
import { Colors } from '../../constants/Colors';

export default function SignInScreen() {
  const router = useRouter();
  const signIn = useAuthStore((state) => state.signIn);
  const isLoading = useAuthStore((state) => state.isLoading);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Грешка', 'Моля, попълнете всички полета');
      return;
    }

    try {
      await signIn(email, password);
      Alert.alert('Успех', 'Влязохте успешно!');
      router.back();
    } catch (error: any) {
      Alert.alert('Грешка', error.message || 'Неуспешен вход');
    }
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 pt-16 pb-6">
        <Text className="text-2xl font-bold">Вход</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <X size={28} color={Colors.text.primary} />
        </TouchableOpacity>
      </View>

      {/* Form */}
      <View className="px-6">
        <View className="mb-4">
          <Text className="text-gray-700 mb-2 font-medium">Email</Text>
          <TextInput
            className="border border-gray-300 rounded-xl px-4 py-3 text-base"
            placeholder="your@email.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!isLoading}
          />
        </View>

        <View className="mb-6">
          <Text className="text-gray-700 mb-2 font-medium">Парола</Text>
          <TextInput
            className="border border-gray-300 rounded-xl px-4 py-3 text-base"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!isLoading}
          />
        </View>

        <TouchableOpacity
          className="rounded-xl py-4 items-center mb-4"
          style={{ backgroundColor: Colors.primary.main, opacity: isLoading ? 0.5 : 1 }}
          onPress={handleSignIn}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={Colors.text.inverse} />
          ) : (
            <Text className="text-white font-semibold text-lg">Вход</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            router.back();
            router.push('/(auth)/signup');
          }}
          disabled={isLoading}
        >
          <Text className="text-center font-semibold" style={{ color: Colors.primary.main }}>
            Нямате акаунт? <Text className="font-semibold">Регистрация</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
