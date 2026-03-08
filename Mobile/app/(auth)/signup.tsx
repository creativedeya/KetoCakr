// ===========================================================
// FILE: mobile/app/(auth)/signup.tsx
// STEP 3: Sign up screen
// ===========================================================
import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const X = (props: any) => <Ionicons name="close" {...props} />;
import { useAuthStore } from '../../store/useAuthStore';
import { Colors } from '../../constants/Colors';

export default function SignUpScreen() {
  const router = useRouter();
  const signUp = useAuthStore((state) => state.signUp);
  const isLoading = useAuthStore((state) => state.isLoading);
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUp = async () => {
    if (!fullName || !email || !password) {
      Alert.alert('Грешка', 'Моля, попълнете всички полета');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Грешка', 'Паролата трябва да е поне 6 символа');
      return;
    }

    try {
      await signUp(email, password, fullName);
      Alert.alert(
        'Успех', 
        'Регистрацията е успешна! Моля, проверете email-а си за потвърждение.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error: any) {
      Alert.alert('Грешка', error.message || 'Неуспешна регистрация');
    }
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 pt-16 pb-6">
        <Text className="text-2xl font-bold">Регистрация</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <X size={28} color={Colors.text.primary} />
        </TouchableOpacity>
      </View>

      {/* Form */}
      <View className="px-6">
        <View className="mb-4">
          <Text className="text-gray-700 mb-2 font-medium">Име</Text>
          <TextInput
            className="border border-gray-300 rounded-xl px-4 py-3 text-base"
            placeholder="Вашето име"
            value={fullName}
            onChangeText={setFullName}
            editable={!isLoading}
          />
        </View>

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
            placeholder="Минимум 6 символа"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!isLoading}
          />
        </View>

        <TouchableOpacity
          className="rounded-xl py-4 items-center mb-4"
          style={{ backgroundColor: Colors.primary.main, opacity: isLoading ? 0.5 : 1 }}
          onPress={handleSignUp}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={Colors.text.inverse} />
          ) : (
            <Text className="text-white font-semibold text-lg">Регистрация</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            router.back();
            router.push('/(auth)/signin');
          }}
          disabled={isLoading}
        >
          <Text className="text-center font-semibold" style={{ color: Colors.primary.main }}>
            Вече имате акаунт? <Text className="font-semibold">Вход</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
