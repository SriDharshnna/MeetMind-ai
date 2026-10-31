import React from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  FileText,
  ChevronRight,
  TrendingUp,
  User,
  RefreshCw
} from 'lucide-react';
import { formatDate, getDeadlineMeta } from '../utils/helpers';
import * as api from '../services/api';

export default function Dashboard({
  meetings,
  tasks,
  decisions,
  setActivePage,
  setSelectedMeetingId
}) {
  // 1. Reactive KPI Counts based strictly on current frontend data
  const totalMeetings = meetings.length;
  const pendingTasks = tasks.filter((t) => t.status === 'Pending').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'In Progress').length;
  const completedTasks = tasks.filter((t) => t.status === 'Completed').length;
  const overdueTasks = tasks.filter((t) => t.isOverdue).length;

  // Pending decisions
  const pendingDecisionsCount = decisions.filter((d) => d.status !== 'Implemented').length;

  // Upcoming deadlines (tasks not yet completed, ordered by priority / deadline)
  const upcomingTasks = tasks
    .filter((t) => t.status !== 'Completed')
    .slice(0, 5);

  const [isScanning, setIsScanning] = React.useState(false);
  const [scanToast, setScanToast] = React.useState('');

  const handleRunMonitoringScan = async () => {
    try {
      setIsScanning(true);
      const res = await api.triggerMonitoringScan();
      setScanToast(`Agent 3 scan complete: ${res?.overdueCount || 0} overdue tasks evaluated.`);
      setTimeout(() => setScanToast(''), 3500);
    } catch (err) {
      setScanToast(`Scan error: ${err.message}`);
      setTimeout(() => setScanToast(''), 3500);
    } finally {
      setIsScanning(false);
    }
  };

  const handleViewMeeting = (id) => {
    setSelectedMeetingId(id);
    setActivePage('meeting-minutes');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* 4 Essential KPI Cards */}
      <div className="grid-4">
        {/* Total Meetings */}
        <div
          className="kpi-card"
          onClick={() => setActivePage('meetings')}
          style={{ cursor: 'pointer' }}
        >
          <div className="kpi-header">
            <span className="kpi-label">Total Meetings</span>
            <div className="kpi-icon-wrap">
              <Calendar size={18} />
            </div>
          </div>
          <div className="kpi-value">{totalMeetings}</div>
          <div className="kpi-desc">
            <span>Recorded in system</span>
          </div>
        </div>

        {/* Pending Tasks */}
        <div
          className="kpi-card pending"
          onClick={() => setActivePage('action-items')}
          style={{ cursor: 'pointer' }}
        >
          <div className="kpi-header">
            <span className="kpi-label">Pending Tasks</span>
            <div className="kpi-icon-wrap pending">
              <Clock size={18} />
            </div>
          </div>
          <div className="kpi-value">{pendingTasks + inProgressTasks}</div>
          <div className="kpi-desc">
            <span>{inProgressTasks} in progress, {pendingTasks} pending</span>
          </div>
        </div>

        {/* Completed Tasks */}
        <div
          className="kpi-card completed"
          onClick={() => setActivePage('action-items')}
          style={{ cursor: 'pointer' }}
        >
          <div className="kpi-header">
            <span className="kpi-label">Completed Tasks</span>
            <div className="kpi-icon-wrap completed">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="kpi-value">{completedTasks}</div>
          <div className="kpi-desc">
            <span>Verified deliverables</span>
          </div>
        </div>

        {/* Overdue Tasks */}
        <div
          className="kpi-card overdue"
          onClick={() => setActivePage('overdue-tasks')}
          style={{ cursor: 'pointer' }}
        >
          <div className="kpi-header">
            <span className="kpi-label">Overdue Tasks</span>
            <div className="kpi-icon-wrap overdue">
              <AlertTriangle size={18} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: 'var(--overdue-coral)' }}>
            {overdueTasks}
          </div>
          <div className="kpi-desc" style={{ color: 'var(--overdue-coral)' }}>
            <span>Requires attention</span>
          </div>
        </div>
      </div>

      {/* Scan Toast */}
      {scanToast && (
        <div className="toast-notice" style={{ zIndex: 100 }}>
          <CheckCircle2 size={16} color="var(--primary-dark)" />
          <span>{scanToast}</span>
        </div>
      )}

      {/* Important AI-Generated Alerts Section */}
      <div className="ai-insights-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="ai-badge">
              <Sparkles size={12} />
              AI ALERTS
            </span>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
              Important Meeting Intelligence Alerts
            </h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={handleRunMonitoringScan}
              disabled={isScanning}
              title="Trigger deterministic Agent 3 overdue check"
            >
              <RefreshCw size={13} className={isScanning ? 'animate-spin' : ''} />
              <span>{isScanning ? 'Scanning...' : 'Scan Deadlines'}</span>
            </button>
            <button
              className="btn btn-soft btn-sm"
              onClick={() => setActivePage('ai-followup')}
            >
              <span>AI Follow-up Agenda</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        <div className="grid-3">
          <div
            onClick={() => setActivePage('overdue-tasks')}
            style={{
              padding: '12px 14px',
              backgroundColor: 'var(--card-white)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--overdue-coral)' }} />
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>
                {overdueTasks} {overdueTasks === 1 ? 'Commitment Overdue' : 'Commitments Overdue'}
              </span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              {overdueTasks > 0
                ? 'Tasks have passed scheduled deadlines without verified completion.'
                : 'All assigned commitments are currently within deadline limits.'}
            </p>
          </div>

          <div
            onClick={() => setActivePage('ai-followup')}
            style={{
              padding: '12px 14px',
              backgroundColor: 'var(--card-white)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--warning-amber)' }} />
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>
                Recurring Topic Detected
              </span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              "API Integration" discussed in multiple meetings without final sign-off.
            </p>
          </div>

          <div
            onClick={() => setActivePage('decisions')}
            style={{
              padding: '12px 14px',
              backgroundColor: 'var(--card-white)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--primary-sage)' }} />
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>
                {pendingDecisionsCount} Decisions in Progress
              </span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              Key architectural and process choices tracked to implementation.
            </p>
          </div>
        </div>
      </div>

      {/* Main Row: Recent Meetings & Upcoming Deadlines */}
      <div className="grid-main-side">
        {/* Recent Meetings Table */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <FileText size={17} color="var(--primary-dark)" />
                Recent Meetings
              </h3>
              <span className="card-subtitle">Latest recorded meeting minutes and discussions</span>
            </div>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setActivePage('meetings')}
            >
              <span>View All</span>
              <ChevronRight size={14} />
            </button>
          </div>

          <div className="table-container" style={{ border: 'none', boxShadow: 'none' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Meeting Title</th>
                  <th>Date</th>
                  <th>Participants</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {meetings.slice(0, 4).map((m) => {
                  const mId = m._id || m.id;
                  return (
                    <tr key={mId}>
                      <td>
                        <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                          {m.title}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '12.5px' }}>
                        {formatDate(m.date)}
                      </td>
                      <td>
                        <div className="avatar-group">
                          {m.participants.slice(0, 3).map((p, i) => (
                            <div
                              key={i}
                              className="avatar-item"
                              style={{ backgroundColor: p.color || 'var(--primary-sage)' }}
                              title={`${p.name} (${p.role})`}
                            >
                              {p.avatar}
                            </div>
                          ))}
                          {m.participants.length > 3 && (
                            <div className="avatar-item" style={{ backgroundColor: 'var(--text-secondary)' }}>
                              +{m.participants.length - 3}
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            m.status === 'Approved' ? 'badge-completed' : 'badge-amber'
                          }`}
                        >
                          {m.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleViewMeeting(mId)}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="card">
          <div className="card-header" style={{ marginBottom: '14px' }}>
            <div>
              <h3 className="card-title">
                <Clock size={17} color="var(--primary-dark)" />
                Upcoming Deadlines
              </h3>
              <span className="card-subtitle">Active team commitments</span>
            </div>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setActivePage('action-items')}
            >
              All Tasks
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {upcomingTasks.length === 0 ? (
              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>No active deadlines pending.</p>
            ) : (
              upcomingTasks.map((t) => {
                const meta = getDeadlineMeta(t.deadline, t.status);
                return (
                  <div
                    key={t.id}
                    style={{
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: meta.isOverdue ? 'var(--overdue-bg)' : 'var(--bg-main)',
                      border: meta.isOverdue ? '1px solid var(--overdue-border)' : '1px solid var(--border-color)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span
                        style={{
                          fontSize: '12.5px',
                          fontWeight: 600,
                          color: 'var(--text-main)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: '170px'
                        }}
                        title={t.title}
                      >
                        {t.title}
                      </span>
                      <span
                        className={`badge ${
                          t.priority === 'High' ? 'badge-amber' : 'badge-sage'
                        }`}
                        style={{ fontSize: '10px', padding: '1px 6px' }}
                      >
                        {t.priority}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                      <span>{t.owner}</span>
                      <span
                        style={{
                          fontWeight: 600,
                          color: meta.isOverdue ? 'var(--overdue-coral)' : 'inherit'
                        }}
                      >
                        {meta.label}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
