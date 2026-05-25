import React, { useEffect, useState } from 'react';
import { ScrollView, Text, View, useColorScheme, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import Card from '../components/Card';
import { api, endpoints } from '../api/client';
import { useColors, palette } from '../theme/colors';

export default function MockTestListScreen({ navigation }: any) {
  const { t } = useTranslation();
  const colors = useColors(useColorScheme() === 'dark' ? 'dark' : 'light');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const r = await api.get(endpoints.mockTests);
      setItems(r.data.items || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const generate = async () => {
    setLoading(true);
    try {
      await api.post(endpoints.mockAuto, { exam: 'CGL' });
      await load();
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
    >
      <Text style={{ fontSize: 22, fontWeight: '800', color: colors.text }}>{t('mock.title')}</Text>

      <TouchableOpacity
        onPress={generate}
        style={{
          backgroundColor: palette.primary,
          padding: 12,
          borderRadius: 10,
          alignItems: 'center',
          marginVertical: 12,
        }}
      >
        <Text style={{ color: '#fff', fontWeight: '700' }}>{t('mock.auto')}</Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator />}
      {items.map((m) => (
        <Card
          key={m._id}
          title={m.title}
          subtitle={`${m.exam} • ${t('mock.questions', { n: m.totalQuestions })} • ${t(
            'mock.duration',
            { mins: Math.round(m.totalDurationSec / 60) },
          )}`}
          onPress={() => navigation.navigate('MockRunner', { mockTestId: m._id })}
        />
      ))}
      {!loading && items.length === 0 && (
        <View style={{ marginTop: 24 }}>
          <Text style={{ color: colors.muted }}>No mocks yet. Tap “Generate New Mock”.</Text>
        </View>
      )}
    </ScrollView>
  );
}
