// ===========================================================
// FILE: mobile/components/auth/Input.tsx
// PART 1: Reusable input component for auth forms
// ===========================================================
import { View, Text, TextInput, TextInputProps, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

// Icon wrappers
const Eye = (props: any) => <Ionicons name="eye-outline" {...props} />;
const EyeOff = (props: any) => <Ionicons name="eye-off-outline" {...props} />;

interface InputProps extends TextInputProps {
  label: string;
  error?: string;
  isPassword?: boolean;
}

export default function Input({ 
  label, 
  error, 
  isPassword, 
  ...props 
}: InputProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  return (
    <View className="mb-4">
      <Text className="text-sm font-semibold mb-2" style={{ color: Colors.text.primary }}>
        {label}
      </Text>
      <View className="relative">
        <TextInput
          {...props}
          secureTextEntry={isPassword && !isPasswordVisible}
          className="bg-white border-2 rounded-xl px-4 py-3 text-base"
          style={{
            borderColor: error ? Colors.error.main : Colors.border.light,
            color: Colors.text.primary
          }}
          placeholderTextColor={Colors.text.tertiary}
        />
        {isPassword && (
          <TouchableOpacity
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            className="absolute right-4 top-3"
          >
            {isPasswordVisible ? (
              <EyeOff size={20} color={Colors.text.tertiary} />
            ) : (
              <Eye size={20} color={Colors.text.tertiary} />
            )}
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Text className="text-xs mt-1" style={{ color: Colors.error.main }}>
          {error}
        </Text>
      )}
    </View>
  );
}
