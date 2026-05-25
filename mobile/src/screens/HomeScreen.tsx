import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, StyleSheet, useColorScheme, RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import Card from '../components/Card';
import { useAuthStore } from '../store/authStore';
import { api, endpoints } from '../api/client';
import { useColors } from '../theme/colors';

export default function HomeScreen({ navigation }: any) {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const colors = useColors(useColorScheme() === 'dark' ? 'dark' : 'light');
  const [plan, setPlan] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const r = await api.post(endpoints.studyPlan);
      setPlan(r.data.plan || []);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={async () => {
            setRefreshing(true);
            await load();
            setRefreshing(false);
          }}
        />
      }
    >
      <Text style={[styles.greeting, { color: colors.text }]}>
        {t('home.greeting', { name: user?.name?.split(' ')[0] || 'Aspirant' })}
      </Text>
      <Text style={[styles.tagline, { color: colors.muted }]}>{t('app.tagline')}</Text>

      <Card
        title={t('home.startMock')}
        subtitle="Real SSC CBT-style mock tests with timer & negative marking"
        onPress={() => navigation.navigate('Mocks')}
      />
      <Card
        title={t('home.smartPractice')}
        subtitle="AI-personalized questions targeting your weak topics"
        onPress={() => navigation.navigate('Practice')}
      />

      <Text style={[styles.section, { color: colors.text }]}>{t('home.todaysPlan')}</Text>
      {plan.slice(0, 3).map((p) => (
        <Card
          key={p.date}
          title={`${p.date} • ${p.focusSubject} / ${p.focusTopic}`}
          subtitle={`${p.targetQuestions} questions${p.targetMockTests ? ' + 1 mock test' : ''}`}
        />
      ))}

      <Text style={[styles.section, { color: colors.text }]}>Daily Features</Text>
      <View style={styles.row}>
        <Card
          title={t('home.dailyQuiz')}
          style={{ flex: 1, marginRight: 6 }}
          onPress={() => navigation.navigate('Daily', { type: 'quiz' })}
        />
        <Card
          title={t('home.currentAffairs')}
          style={{ flex: 1, marginLeft: 6 }}
          onPress={() => navigation.navigate('Daily', { type: 'currentAffairs' })}
        />
      </View>
      <View style={styles.row}>
        <Card
          title={t('home.vocabulary')}
          style={{ flex: 1, marginRight: 6 }}
          onPress={() => navigation.navigate('Daily', { type: 'vocabulary' })}
        />
        <Card
          title={t('home.miniTest')}
          style={{ flex: 1, marginLeft: 6 }}
          onPress={() => navigation.navigate('Daily', { type: 'miniTest' })}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  greeting: { fontSize: 26, fontWeight: '800' },
  tagline: { fontSize: 13, marginBottom: 12 },
  section: { fontSize: 16, fontWeight: '700', marginTop: 18, marginBottom: 4 },
  row: { flexDirection: 'row' },
});
