import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, useColorScheme } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';
import { useColors, palette } from '../theme/colors';

export default function LoginScreen({ navigation }: any) {
  const { t } = useTranslation();
  const login = useAuthStore((s) => s.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const colors = useColors(useColorScheme() === 'dark' ? 'dark' : 'light');

  const onSubmit = async () => {
    setBusy(true);
    try {
      await login(email.trim(), password);
    } catch (e: any) {
      Alert.alert(t('common.error'), e?.response?.data?.error || e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <Text style={[styles.brand, { color: palette.primary }]}>{t('app.name')}</Text>
      <Text style={[styles.tagline, { color: colors.muted }]}>{t('app.tagline')}</Text>
      <Text style={[styles.title, { color: colors.text }]}>{t('auth.loginTitle')}</Text>

      <TextInput
        placeholder={t('auth.email')}
        placeholderTextColor={colors.muted}
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        style={[styles.input, { color: colors.text, borderColor: colors.border }]}
      />
      <TextInput
        placeholder={t('auth.password')}
        placeholderTextColor={colors.muted}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={[styles.input, { color: colors.text, borderColor: colors.border }]}
      />

      <TouchableOpacity onPress={onSubmit} disabled={busy} style={styles.button}>
        <Text style={styles.buttonText}>{busy ? '...' : t('auth.login')}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Signup')} style={styles.linkBtn}>
        <Text style={{ color: palette.primary, textAlign: 'center' }}>
          {t('auth.switchToSignup')}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  brand: { fontSize: 32, fontWeight: '800', textAlign: 'center' },
  tagline: { textAlign: 'center', marginBottom: 24 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 16 },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    fontSize: 15,
  },
  button: {
    backgroundColor: palette.primary,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  linkBtn: { padding: 12 },
});
