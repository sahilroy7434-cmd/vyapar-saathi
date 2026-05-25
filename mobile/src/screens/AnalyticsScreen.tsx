import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, useColorScheme, ActivityIndicator, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { api, endpoints } from '../api/client';
import { useColors } from '../theme/colors';
import Card from '../components/Card';

export default function AnalyticsScreen() {
  const { t } = useTranslation();
  const colors = useColors(useColorScheme() === 'dark' ? 'dark' : 'light');
  const [data, setData] = useState<any | null>(null);
  const [board, setBoard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [dash, lb] = await Promise.all([
          api.get(endpoints.analyticsDashboard),
          api.get(endpoints.leaderboard),
        ]);
        setData(dash.data);
        setBoard(lb.data.items || []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} />;
  const summary = data?.summary || {};

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ padding: 16 }}>
      <Text style={[styles.h1, { color: colors.text }]}>{t('analytics.title')}</Text>

      <View style={styles.kpiRow}>
        <View style={[styles.kpi, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={{ color: colors.muted, fontSize: 12 }}>{t('analytics.accuracy')}</Text>
          <Text style={{ color: colors.text, fontSize: 22, fontWeight: '800' }}>
            {((summary.avgAccuracy || 0) * 100).toFixed(1)}%
          </Text>
        </View>
        <View style={[styles.kpi, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={{ color: colors.muted, fontSize: 12 }}>Attempts</Text>
          <Text style={{ color: colors.text, fontSize: 22, fontWeight: '800' }}>{summary.attempts || 0}</Text>
        </View>
        <View style={[styles.kpi, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={{ color: colors.muted, fontSize: 12 }}>Correct</Text>
          <Text style={{ color: colors.text, fontSize: 22, fontWeight: '800' }}>
            {summary.totalCorrect || 0}
          </Text>
        </View>
      </View>

      <Text style={[styles.section, { color: colors.text }]}>{t('analytics.weakTopics')}</Text>
      {(data?.weakTopics || []).map((w: any, i: number) => (
        <Card
          key={i}
          title={`${w.subject} · ${w.topic}`}
          subtitle={`Accuracy ${(w.accuracy * 100).toFixed(0)}% · ${w.attempts} attempts`}
        />
      ))}
      {(data?.weakTopics || []).length === 0 && (
        <Text style={{ color: colors.muted }}>Not enough data yet — practice more to see weak areas.</Text>
      )}

      <Text style={[styles.section, { color: colors.text }]}>{t('analytics.leaderboard')}</Text>
      {board.slice(0, 10).map((row: any, i: number) => (
        <Card
          key={row.userId}
          title={`#${i + 1} · ${row.name}`}
          subtitle={`Best: ${row.bestScore} · Avg accuracy: ${(row.avgAccuracy * 100).toFixed(1)}%`}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  h1: { fontSize: 22, fontWeight: '800', marginBottom: 12 },
  section: { fontSize: 16, fontWeight: '700', marginTop: 18, marginBottom: 6 },
  kpiRow: { flexDirection: 'row', gap: 8 },
  kpi: { flex: 1, borderWidth: 1, borderRadius: 12, padding: 12 },
});
