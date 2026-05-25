import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  useColorScheme,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { api, endpoints } from '../api/client';
import { useColors, palette } from '../theme/colors';

const SUBJECTS = [
  { key: 'QA', label: 'Quant Aptitude' },
  { key: 'REASONING', label: 'Reasoning' },
  { key: 'ENGLISH', label: 'English' },
  { key: 'GA', label: 'General Awareness' },
  { key: 'CURRENT_AFFAIRS', label: 'Current Affairs' },
];

const DIFFICULTIES = ['easy', 'medium', 'hard'];

export default function PracticeScreen() {
  const { t } = useTranslation();
  const colors = useColors(useColorScheme() === 'dark' ? 'dark' : 'light');
  const [subject, setSubject] = useState('QA');
  const [difficulty, setDifficulty] = useState('medium');
  const [questions, setQuestions] = useState<any[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [reveal, setReveal] = useState(false);
  const [loading, setLoading] = useState(false);

  const start = async () => {
    setLoading(true);
    setQuestions([]);
    setIndex(0);
    setSelected(null);
    setReveal(false);
    try {
      const r = await api.get(endpoints.practice, {
        params: { subject, difficulty, count: 10 },
      });
      setQuestions(r.data.items || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    start();
  }, []); // initial load

  const q = questions[index];

  const submitAnswer = () => {
    setReveal(true);
  };

  const nextQ = () => {
    setSelected(null);
    setReveal(false);
    setIndex((i) => Math.min(i + 1, questions.length - 1));
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: 16 }}
    >
      <Text style={[styles.title, { color: colors.text }]}>{t('practice.title')}</Text>

      <Text style={[styles.label, { color: colors.muted }]}>{t('practice.selectSubject')}</Text>
      <View style={styles.row}>
        {SUBJECTS.map((s) => (
          <TouchableOpacity
            key={s.key}
            onPress={() => setSubject(s.key)}
            style={[
              styles.chip,
              { borderColor: colors.border },
              subject === s.key && { backgroundColor: palette.primary, borderColor: palette.primary },
            ]}
          >
            <Text style={{ color: subject === s.key ? '#fff' : colors.text, fontSize: 12 }}>
              {s.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.label, { color: colors.muted }]}>{t('practice.selectDifficulty')}</Text>
      <View style={styles.row}>
        {DIFFICULTIES.map((d) => (
          <TouchableOpacity
            key={d}
            onPress={() => setDifficulty(d)}
            style={[
              styles.chip,
              { borderColor: colors.border },
              difficulty === d && { backgroundColor: palette.primary, borderColor: palette.primary },
            ]}
          >
            <Text style={{ color: difficulty === d ? '#fff' : colors.text }}>{d}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity onPress={start} style={[styles.btn, { marginTop: 12 }]}>
        <Text style={styles.btnText}>{t('practice.start')}</Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator style={{ marginTop: 24 }} />}

      {q && (
        <View style={[styles.qCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={{ color: colors.muted, marginBottom: 6 }}>
            {index + 1} / {questions.length}
          </Text>
          <Text style={[styles.qText, { color: colors.text }]}>{q.question}</Text>
          {(q.options || []).map((opt: any) => {
            const isCorrect = reveal && opt.key === q.correctAnswer;
            const isWrong = reveal && opt.key === selected && opt.key !== q.correctAnswer;
            return (
              <TouchableOpacity
                key={opt.key}
                disabled={reveal}
                onPress={() => setSelected(opt.key)}
                style={[
                  styles.option,
                  {
                    borderColor: isCorrect
                      ? colors.success
                      : isWrong
                      ? colors.danger
                      : selected === opt.key
                      ? palette.primary
                      : colors.border,
                  },
                ]}
              >
                <Text style={{ color: colors.text }}>
                  {opt.key}. {opt.text}
                </Text>
              </TouchableOpacity>
            );
          })}
          {reveal && (
            <View style={{ marginTop: 12 }}>
              <Text style={{ color: colors.text, fontWeight: '700' }}>Explanation</Text>
              <Text style={{ color: colors.muted, marginTop: 4 }}>{q.explanation}</Text>
              {!!q.tricks && (
                <>
                  <Text style={{ color: colors.text, fontWeight: '700', marginTop: 8 }}>Trick</Text>
                  <Text style={{ color: colors.muted, marginTop: 4 }}>{q.tricks}</Text>
                </>
              )}
            </View>
          )}
          <View style={{ flexDirection: 'row', marginTop: 14 }}>
            {!reveal ? (
              <TouchableOpacity onPress={submitAnswer} disabled={!selected} style={[styles.btn, { flex: 1 }]}>
                <Text style={styles.btnText}>Check</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={nextQ} style={[styles.btn, { flex: 1 }]}>
                <Text style={styles.btnText}>{t('mock.next')}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: '800', marginBottom: 12 },
  label: { fontSize: 13, marginTop: 12, marginBottom: 6 },
  row: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
    borderRadius: 999,
  },
  btn: { backgroundColor: palette.primary, padding: 12, borderRadius: 10, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '700' },
  qCard: { borderWidth: 1, borderRadius: 14, padding: 14, marginTop: 16 },
  qText: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  option: { borderWidth: 1.5, padding: 12, borderRadius: 10, marginBottom: 8 },
});
