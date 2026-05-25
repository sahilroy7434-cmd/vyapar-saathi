import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  useColorScheme,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { api, endpoints } from '../api/client';
import { useColors, palette } from '../theme/colors';

type Q = { _id: string; question: string; options: { key: string; text: string }[] };

export default function MockRunnerScreen({ route, navigation }: any) {
  const { mockTestId } = route.params;
  const { t } = useTranslation();
  const colors = useColors(useColorScheme() === 'dark' ? 'dark' : 'light');

  const [mock, setMock] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [section, setSection] = useState(0);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [marked, setMarked] = useState<Record<string, boolean>>({});
  const [secondsLeft, setSecondsLeft] = useState(0);
  const startedAt = useRef(Date.now());

  useEffect(() => {
    (async () => {
      try {
        const r = await api.get(`${endpoints.mockTests}/${mockTestId}`);
        setMock(r.data.mockTest);
        setSecondsLeft(r.data.mockTest.totalDurationSec);
      } finally {
        setLoading(false);
      }
    })();
  }, [mockTestId]);

  useEffect(() => {
    if (!mock) return;
    const id = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(id);
          submit();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mock]);

  const allQuestions: Q[] = useMemo(
    () => (mock ? mock.sections.flatMap((s: any) => s.questions) : []),
    [mock],
  );

  if (loading || !mock) return <ActivityIndicator style={{ marginTop: 40 }} />;

  const sec = mock.sections[section];
  const q: Q = sec.questions[index];
  const mins = Math.floor(secondsLeft / 60).toString().padStart(2, '0');
  const ss = (secondsLeft % 60).toString().padStart(2, '0');

  const submit = async () => {
    const elapsed = Math.floor((Date.now() - startedAt.current) / 1000);
    const payloadAnswers = allQuestions.map((qq) => ({
      questionId: qq._id,
      selected: answers[qq._id] ?? null,
      marked: !!marked[qq._id],
      skipped: !answers[qq._id],
      timeSpentSec: 0,
    }));
    try {
      const r = await api.post(endpoints.attemptsSubmit, {
        mode: 'mock',
        mockTestId,
        timeSpentSec: elapsed,
        answers: payloadAnswers,
      });
      Alert.alert(
        t('mock.submitted'),
        `Score: ${r.data.attempt.score} / ${r.data.attempt.maxScore}\nAccuracy: ${(
          r.data.attempt.accuracy * 100
        ).toFixed(1)}%`,
        [{ text: t('common.ok'), onPress: () => navigation.goBack() }],
      );
    } catch (e: any) {
      Alert.alert(t('common.error'), e?.response?.data?.error || e.message);
    }
  };

  const goNext = () => {
    if (index < sec.questions.length - 1) setIndex(index + 1);
    else if (section < mock.sections.length - 1) {
      setSection(section + 1);
      setIndex(0);
    }
  };
  const goPrev = () => {
    if (index > 0) setIndex(index - 1);
    else if (section > 0) {
      setSection(section - 1);
      setIndex(mock.sections[section - 1].questions.length - 1);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View
        style={{
          padding: 12,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottomWidth: 1,
          borderColor: colors.border,
        }}
      >
        <Text style={{ color: colors.text, fontWeight: '700' }}>{sec.name}</Text>
        <Text style={{ color: palette.danger, fontWeight: '800' }}>
          {t('mock.timeLeft')}: {mins}:{ss}
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ color: colors.muted, marginBottom: 6 }}>
          Q{index + 1} / {sec.questions.length}
        </Text>
        <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600', marginBottom: 12 }}>
          {q?.question}
        </Text>
        {(q?.options || []).map((opt) => {
          const sel = answers[q._id] === opt.key;
          return (
            <TouchableOpacity
              key={opt.key}
              onPress={() => setAnswers((a) => ({ ...a, [q._id]: opt.key }))}
              style={{
                borderWidth: 1.5,
                borderColor: sel ? palette.primary : colors.border,
                padding: 12,
                borderRadius: 10,
                marginBottom: 8,
                backgroundColor: sel ? '#dbeafe' : 'transparent',
              }}
            >
              <Text style={{ color: sel ? palette.primaryDark : colors.text }}>
                {opt.key}. {opt.text}
              </Text>
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity
          onPress={() => setMarked((m) => ({ ...m, [q._id]: !m[q._id] }))}
          style={{ marginTop: 8 }}
        >
          <Text style={{ color: marked[q._id] ? palette.warning : colors.muted }}>
            {marked[q._id] ? '★ ' : '☆ '}
            {t('mock.mark')}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={{ flexDirection: 'row', padding: 12, gap: 8 }}>
        <TouchableOpacity
          onPress={goPrev}
          style={{
            flex: 1,
            borderWidth: 1,
            borderColor: colors.border,
            padding: 12,
            borderRadius: 10,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: colors.text }}>{t('mock.prev')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={goNext}
          style={{ flex: 1, backgroundColor: palette.primary, padding: 12, borderRadius: 10, alignItems: 'center' }}
        >
          <Text style={{ color: '#fff', fontWeight: '700' }}>{t('mock.next')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={submit}
          style={{ flex: 1, backgroundColor: palette.danger, padding: 12, borderRadius: 10, alignItems: 'center' }}
        >
          <Text style={{ color: '#fff', fontWeight: '700' }}>{t('mock.submit')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
