import React, { useEffect, useState } from 'react';
import { ScrollView, Text, View, ActivityIndicator, useColorScheme, StyleSheet } from 'react-native';
import { api, endpoints } from '../api/client';
import { useColors } from '../theme/colors';
import Card from '../components/Card';

export default function DailyScreen({ route }: any) {
  const type = route?.params?.type || 'quiz';
  const colors = useColors(useColorScheme() === 'dark' ? 'dark' : 'light');
  const [item, setItem] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const r = await api.get(`${endpoints.daily}/${type}`);
        setItem(r.data.item);
      } catch {
        setItem(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [type]);

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} />;
  if (!item)
    return (
      <View style={{ padding: 16, backgroundColor: colors.bg, flex: 1 }}>
        <Text style={{ color: colors.muted }}>Nothing for today yet — check back later.</Text>
      </View>
    );

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ padding: 16 }}>
      <Text style={[styles.h1, { color: colors.text }]}>{item.title}</Text>
      {!!item.summary && <Text style={{ color: colors.muted, marginBottom: 12 }}>{item.summary}</Text>}

      {item.type === 'quiz' &&
        (item.questions || []).map((q: any) => (
          <Card key={q._id} title={q.question} subtitle={`${q.subject} · ${q.topic}`} />
        ))}

      {item.type === 'currentAffairs' &&
        ((item.payload?.articles || []) as any[]).map((a, i) => (
          <Card key={i} title={a.title} subtitle={a.tag} />
        ))}

      {item.type === 'vocabulary' &&
        ((item.payload?.words || []) as any[]).map((w, i) => (
          <Card key={i} title={w.word} subtitle={`${w.meaning} — “${w.sentence}”`} />
        ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  h1: { fontSize: 22, fontWeight: '800', marginBottom: 8 },
});
