import React from 'react';
import { ScrollView, Text, View, TouchableOpacity, useColorScheme, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import { useAuthStore } from '../store/authStore';
import { useColors, palette } from '../theme/colors';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const colors = useColors(useColorScheme() === 'dark' ? 'dark' : 'light');

  const switchLang = (lng: 'en' | 'hi') => {
    i18n.changeLanguage(lng);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ padding: 16 }}>
      <Text style={[styles.h1, { color: colors.text }]}>{t('profile.title')}</Text>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700' }}>{user?.name}</Text>
        <Text style={{ color: colors.muted, marginTop: 4 }}>{user?.email}</Text>
        {user?.targetExams?.length ? (
          <Text style={{ color: colors.muted, marginTop: 8 }}>
            Target exams: {user.targetExams.join(', ')}
          </Text>
        ) : null}
      </View>

      <Text style={[styles.section, { color: colors.text }]}>{t('profile.language')}</Text>
      <View style={{ flexDirection: 'row' }}>
        {(['en', 'hi'] as const).map((lng) => (
          <TouchableOpacity
            key={lng}
            onPress={() => switchLang(lng)}
            style={[
              styles.chip,
              {
                borderColor: i18n.language === lng ? palette.primary : colors.border,
                backgroundColor: i18n.language === lng ? palette.primary : 'transparent',
              },
            ]}
          >
            <Text style={{ color: i18n.language === lng ? '#fff' : colors.text, fontWeight: '600' }}>
              {lng === 'en' ? 'English' : 'हिन्दी'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        onPress={logout}
        style={{ marginTop: 24, padding: 14, backgroundColor: palette.danger, borderRadius: 10, alignItems: 'center' }}
      >
        <Text style={{ color: '#fff', fontWeight: '700' }}>{t('profile.logout')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  h1: { fontSize: 22, fontWeight: '800', marginBottom: 12 },
  section: { fontSize: 14, fontWeight: '700', marginTop: 18, marginBottom: 6 },
  card: { borderWidth: 1, borderRadius: 12, padding: 14 },
  chip: { borderWidth: 1.5, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999, marginRight: 8 },
});
