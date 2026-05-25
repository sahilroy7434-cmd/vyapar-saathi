import React, { useEffect, useState } from 'react';
import { api } from '../api';

const EXAMS = ['CGL', 'CHSL', 'MTS', 'GD', 'CPO', 'JE', 'STENO'];
const SUBJECTS = ['QA', 'REASONING', 'ENGLISH', 'GA', 'CURRENT_AFFAIRS'];
const DIFFICULTIES = ['easy', 'medium', 'hard'];

const empty = {
  exam: 'CGL',
  subject: 'QA',
  topic: '',
  difficulty: 'medium',
  question: '',
  options: [
    { key: 'A', text: '' },
    { key: 'B', text: '' },
    { key: 'C', text: '' },
    { key: 'D', text: '' },
  ],
  correctAnswer: 'A',
  explanation: '',
  tricks: '',
  isPYQ: false,
};

export default function QuestionsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [filter, setFilter] = useState<{ exam?: string; subject?: string }>({});
  const [draft, setDraft] = useState<any>(empty);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const load = async () => {
    const r = await api.get('/questions', { params: { ...filter, limit: 50 } });
    setItems(r.data.items || []);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter.exam, filter.subject]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      await api.post('/admin/questions', draft);
      setMsg('Question added.');
      setDraft(empty);
      await load();
    } catch (e: any) {
      setMsg(e?.response?.data?.message || 'Failed to save');
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this question?')) return;
    await api.delete(`/admin/questions/${id}`);
    await load();
  };

  return (
    <>
      <h1 className="h1">Questions</h1>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Add a question</h3>
        <form onSubmit={submit}>
          <div className="row3">
            <div>
              <label>Exam</label>
              <select value={draft.exam} onChange={(e) => setDraft({ ...draft, exam: e.target.value })}>
                {EXAMS.map((e) => (
                  <option key={e}>{e}</option>
                ))}
              </select>
            </div>
            <div>
              <label>Subject</label>
              <select
                value={draft.subject}
                onChange={(e) => setDraft({ ...draft, subject: e.target.value })}
              >
                {SUBJECTS.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label>Difficulty</label>
              <select
                value={draft.difficulty}
                onChange={(e) => setDraft({ ...draft, difficulty: e.target.value })}
              >
                {DIFFICULTIES.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>
          <label>Topic</label>
          <input value={draft.topic} onChange={(e) => setDraft({ ...draft, topic: e.target.value })} required />
          <label>Question</label>
          <textarea
            rows={2}
            value={draft.question}
            onChange={(e) => setDraft({ ...draft, question: e.target.value })}
            required
          />
          <div className="row">
            {draft.options.map((opt: any, idx: number) => (
              <div key={opt.key}>
                <label>Option {opt.key}</label>
                <input
                  value={opt.text}
                  onChange={(e) => {
                    const options = [...draft.options];
                    options[idx] = { ...options[idx], text: e.target.value };
                    setDraft({ ...draft, options });
                  }}
                  required
                />
              </div>
            ))}
          </div>
          <div className="row">
            <div>
              <label>Correct Answer</label>
              <select
                value={draft.correctAnswer}
                onChange={(e) => setDraft({ ...draft, correctAnswer: e.target.value })}
              >
                {draft.options.map((o: any) => (
                  <option key={o.key}>{o.key}</option>
                ))}
              </select>
            </div>
            <div>
              <label>Mark as PYQ</label>
              <select
                value={String(draft.isPYQ)}
                onChange={(e) => setDraft({ ...draft, isPYQ: e.target.value === 'true' })}
              >
                <option value="false">No</option>
                <option value="true">Yes</option>
              </select>
            </div>
          </div>
          <label>Explanation</label>
          <textarea
            rows={2}
            value={draft.explanation}
            onChange={(e) => setDraft({ ...draft, explanation: e.target.value })}
          />
          <label>Tricks</label>
          <input value={draft.tricks} onChange={(e) => setDraft({ ...draft, tricks: e.target.value })} />
          {msg && <div style={{ marginTop: 8, fontSize: 13 }}>{msg}</div>}
          <div style={{ marginTop: 12 }}>
            <button type="submit" disabled={busy}>
              {busy ? '...' : 'Save question'}
            </button>
          </div>
        </form>
      </div>

      <div className="card">
        <div style={{ display: 'flex', gap: 8, alignItems: 'end', marginBottom: 12 }}>
          <div style={{ flex: 1 }}>
            <label>Filter exam</label>
            <select
              value={filter.exam || ''}
              onChange={(e) => setFilter({ ...filter, exam: e.target.value || undefined })}
            >
              <option value="">All</option>
              {EXAMS.map((e) => (
                <option key={e}>{e}</option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label>Filter subject</label>
            <select
              value={filter.subject || ''}
              onChange={(e) => setFilter({ ...filter, subject: e.target.value || undefined })}
            >
              <option value="">All</option>
              {SUBJECTS.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>Exam</th>
              <th>Subject</th>
              <th>Topic</th>
              <th>Difficulty</th>
              <th>Question</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((q) => (
              <tr key={q._id}>
                <td>{q.exam}</td>
                <td>{q.subject}</td>
                <td>{q.topic}</td>
                <td>
                  <span className="tag">{q.difficulty}</span>
                  {q.isPYQ && <span className="tag">PYQ</span>}
                </td>
                <td style={{ maxWidth: 360 }}>{q.question}</td>
                <td>
                  <button className="danger" onClick={() => remove(q._id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
