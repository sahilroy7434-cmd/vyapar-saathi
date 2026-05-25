import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, useColorScheme } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';
import { useColors, palette } from '../theme/colors';

export default function SignupScreen({ navigation }: any) {
  const { t } = useTranslation();
  const signup = useAuthStore((s) => s.signup);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const colors = useColors(useColorScheme() === 'dark' ? 'dark' : 'light');

  const onSubmit = async () => {
    setBusy(true);
    try {
      await signup(name.trim(), email.trim(), password);
    } catch (e: any) {
      Alert.alert(t('common.error'), e?.response?.data?.error || e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <Text style={[styles.title, { color: colors.text }]}>{t('auth.signupTitle')}</Text>
      <TextInput
        placeholder={t('auth.name')}
        placeholderTextColor={colors.muted}
        value={name}
        onChangeText={setName}
        style={[styles.input, { color: colors.text, borderColor: colors.border }]}
      />
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
        <Text style={styles.buttonText}>{busy ? '...' : t('auth.signup')}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Login')} style={{ padding: 12 }}>
        <Text style={{ color: palette.primary, textAlign: 'center' }}>
          {t('auth.switchToLogin')}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 16 },
  input: { borderWidth: 1, borderRadius: 10, padding: 14, marginBottom: 12, fontSize: 15 },
  button: { backgroundColor: palette.primary, padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
