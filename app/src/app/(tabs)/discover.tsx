import { Text, View } from 'react-native';
import { colors, type } from '@/theme/tokens';

export default function Screen() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
      <Text style={type.title}>discover</Text>
    </View>
  );
}
