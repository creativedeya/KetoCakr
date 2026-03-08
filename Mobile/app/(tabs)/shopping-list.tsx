import { View, Text } from 'react-native';
import { Colors } from '../../constants/Colors';

export default function ShoppingListScreen() {
  console.log('🛒 Shopping List Screen Rendering!');

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background.primary }}>
      <Text style={{ fontSize: 32, fontWeight: 'bold' }}>🛒</Text>
      <Text style={{ fontSize: 24, marginTop: 20 }}>Shopping List</Text>
      <Text style={{ fontSize: 16, color: Colors.text.secondary, marginTop: 10 }}>Screen works!</Text>
    </View>
  );
}