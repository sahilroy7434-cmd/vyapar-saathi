import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

export default function LoginPage() {
  const nav = useNavigate();
  const [email, setEmail] = useState('admin@sscsaathi.app');
  const [password, setPassword] = useState('admin@1234');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      const r = await api.post('/auth/login', { email, password });
      if (r.data.user.role !== 'admin') {
        setErr('This account is not an admin.');
        return;
      }
      localStorage.setItem('admin_token', r.data.accessToken);
      nav('/', { replace: true });
    } catch (e: any) {
      setErr(e?.response?.data?.error || e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="center">
      <div className="card login-card">
        <h2 style={{ margin: 0, marginBottom: 16 }}>SSC Saathi · Admin</h2>
        <form onSubmit={submit}>
          <label>Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
          <label>Password</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
          />
          {err && <div style={{ color: 'var(--danger)', fontSize: 13, marginTop: 8 }}>{err}</div>}
          <div style={{ marginTop: 16 }}>
            <button type="submit" disabled={busy}>
              {busy ? '...' : 'Log in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
