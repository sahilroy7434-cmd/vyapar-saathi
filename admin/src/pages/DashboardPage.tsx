import React, { useEffect, useState } from 'react';
import { api } from '../api';

export default function DashboardPage() {
  const [stats, setStats] = useState<any>({});

  useEffect(() => {
    api.get('/admin/stats').then((r) => setStats(r.data));
  }, []);

  return (
    <>
      <h1 className="h1">Dashboard</h1>
      <div className="kpis">
        <div className="kpi">
          <div className="l">Questions</div>
          <div className="v">{stats.questions ?? '—'}</div>
        </div>
        <div className="kpi">
          <div className="l">Users</div>
          <div className="v">{stats.users ?? '—'}</div>
        </div>
        <div className="kpi">
          <div className="l">Mock Tests</div>
          <div className="v">{stats.mocks ?? '—'}</div>
        </div>
        <div className="kpi">
          <div className="l">Daily Items</div>
          <div className="v">{stats.daily ?? '—'}</div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Quick links</h3>
        <ul>
          <li>Use <strong>Questions</strong> to add or bulk-import items.</li>
          <li>Use <strong>Mock Tests</strong> to publish curated tests, or trigger auto-generation from the API.</li>
          <li>POST <code>/v1/admin/daily</code> to push daily quiz / current affairs / vocabulary.</li>
        </ul>
      </div>
    </>
  );
}
