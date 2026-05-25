import React from 'react';
import { View, Text, StyleSheet, useColorScheme, TouchableOpacity, ViewStyle } from 'react-native';
import { useColors } from '../theme/colors';

type Props = {
  title?: string;
  subtitle?: string;
  onPress?: () => void;
  children?: React.ReactNode;
  style?: ViewStyle;
};

export default function Card({ title, subtitle, onPress, children, style }: Props) {
  const colors = useColors(useColorScheme() === 'dark' ? 'dark' : 'light');
  const Wrapper: any = onPress ? TouchableOpacity : View;
  return (
    <Wrapper
      onPress={onPress}
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
        style,
      ]}
    >
      {title ? <Text style={[styles.title, { color: colors.text }]}>{title}</Text> : null}
      {subtitle ? <Text style={[styles.subtitle, { color: colors.muted }]}>{subtitle}</Text> : null}
      {children}
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginVertical: 6,
  },
  title: { fontSize: 16, fontWeight: '700' },
  subtitle: { fontSize: 13, marginTop: 4 },
});
