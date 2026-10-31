import React, { useState } from 'react';
import {
  User,
  Bell,
  Sliders,
  CheckCircle2,
  Save,
  RotateCcw
} from 'lucide-react';

export default function Settings({ onResetData }) {
  const [name, setName] = useState('Sarah Jenkins');
  const [email, setEmail] = useState('sarah.jenkins@company.com');
  const [role, setRole] = useState('Head of Product');
  const [department, setDepartment] = useState('Product & Engineering');

  // Notification toggles
  const [overdueAlerts, setOverdueAlerts] = useState(true);
  const [dailyBriefings, setDailyBriefings] = useState(true);
  const [repeatedTopicAlerts, setRepeatedTopicAlerts] = useState(true);

  // App preferences
  const [meetingDuration, setMeetingDuration] = useState('45');
  const [dateFormat, setDateFormat] = useState('YYYY-MM-DD');

  const [toastMessage, setToastMessage] = useState('');

  const handleSave = (e) => {
    e.preventDefault();
    setToastMessage('System settings and preferences updated.');
    setTimeout(() => setToastMessage(''), 2500);
  };

  const handleReset = () => {
    if (window.confirm('Reset all meeting records, tasks, and decisions to initial demonstration sample data?')) {
      if (onResetData) onResetData();
      setToastMessage('All data reset to initial sample records.');
      setTimeout(() => setToastMessage(''), 3000);
    }
  };

  return (
    <div style={{ maxWidth: '840px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {toastMessage && (
        <div className="toast-notice">
          <CheckCircle2 size={16} color="var(--primary-dark)" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Profile Card */}
      <div className="card" style={{ padding: '24px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <User size={18} color="var(--primary-dark)" />
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
              User Profile & Role
            </h3>
          </div>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleReset}
            title="Reset localStorage back to initial sample state"
          >
            <RotateCcw size={13} />
            <span>Reset Sample Data</span>
          </button>
        </div>

        <form onSubmit={handleSave}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
            <div
              className="user-avatar"
              style={{ width: '56px', height: '56px', fontSize: '18px', backgroundColor: 'var(--primary-dark)' }}
            >
              SJ
            </div>
            <div>
              <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                {name}
              </h4>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
                {role} • {department}
              </p>
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Role Title</label>
              <input
                type="text"
                className="form-input"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Department</label>
              <input
                type="text"
                className="form-input"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Notifications Card */}
          <div style={{ marginTop: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Bell size={16} color="var(--primary-dark)" />
              <h3 style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                Notification Preferences
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', padding: '10px 14px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-main)' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>
                    Overdue Commitment Alerts
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                    Immediate alert when a task misses its calendar target.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={overdueAlerts}
                  onChange={(e) => setOverdueAlerts(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--primary-dark)' }}
                />
              </label>

              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', padding: '10px 14px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-main)' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>
                    Daily Agentic Summary
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                    Morning consolidated briefing of pending team deliverables.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={dailyBriefings}
                  onChange={(e) => setDailyBriefings(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--primary-dark)' }}
                />
              </label>

              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', padding: '10px 14px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-main)' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>
                    Repeated Unresolved Topic Alerts
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                    Notify when a topic appears across multiple meetings without sign-off.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={repeatedTopicAlerts}
                  onChange={(e) => setRepeatedTopicAlerts(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--primary-dark)' }}
                />
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '22px' }}>
            <button type="submit" className="btn btn-primary">
              <Save size={14} />
              <span>Save System Settings</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
