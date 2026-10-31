import React, { useState } from 'react';
import {
  AlertTriangle,
  Clock,
  User,
  Calendar,
  ExternalLink,
  CheckCircle2,
  Bell,
  ArrowRight
} from 'lucide-react';
import { formatDate, getDeadlineMeta } from '../utils/helpers';

export default function OverdueTasks({
  tasks,
  onUpdateTaskStatus,
  setActivePage,
  setSelectedMeetingId
}) {
  const [toastMessage, setToastMessage] = useState('');

  // Critical Agentic Rule: Completed tasks are NEVER classified as overdue!
  const overdueTasks = tasks.filter((t) => t.isOverdue && t.status !== 'Completed');

  const handleRemind = (taskTitle, owner) => {
    setToastMessage(`Automated reminder notification sent to ${owner} for "${taskTitle}".`);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleOpenMeeting = (meetingId) => {
    if (meetingId) {
      setSelectedMeetingId(meetingId);
      setActivePage('meeting-minutes');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {toastMessage && (
        <div className="toast-notice" style={{ borderLeftColor: 'var(--overdue-coral)' }}>
          <Bell size={16} color="var(--overdue-coral)" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Overdue Warning & Rule Header */}
      <div
        className="card"
        style={{
          backgroundColor: 'var(--overdue-bg)',
          border: '1px solid var(--overdue-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px',
          padding: '18px 24px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#FFFFFF',
              color: 'var(--overdue-coral)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--overdue-border)',
              flexShrink: 0
            }}
          >
            <AlertTriangle size={20} />
          </div>

          <div>
            <h2 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 2px 0' }}>
              {overdueTasks.length} {overdueTasks.length === 1 ? 'Overdue Task' : 'Overdue Tasks'}
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
              <strong>Zero-Hallucination Policy:</strong> Overdue status is calculated against calendar timestamps. Once a task is completed, it is immediately removed from overdue tracking.
            </p>
          </div>
        </div>

        <button
          className="btn btn-primary btn-sm"
          onClick={() => setActivePage('ai-followup')}
        >
          <span>View Follow-up Agenda</span>
          <ArrowRight size={13} />
        </button>
      </div>

      {/* Overdue Tasks List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {overdueTasks.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '42px 20px' }}>
            <CheckCircle2 size={32} color="var(--status-completed)" style={{ margin: '0 auto 10px auto' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
              No Overdue Tasks!
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '12.5px' }}>
              All team deliverables are currently up to date or marked completed.
            </p>
          </div>
        ) : (
          overdueTasks.map((t) => {
            const meta = getDeadlineMeta(t.deadline, t.status);
            return (
              <div
                key={t.id}
                className="card"
                style={{
                  borderLeft: '4px solid var(--overdue-coral)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '14px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                        {t.title}
                      </h3>
                      <span className="badge badge-overdue">
                        {meta.label}
                      </span>
                      <span
                        className={`badge ${
                          t.priority === 'High' ? 'badge-amber' : 'badge-sage'
                        }`}
                        style={{ fontSize: '10px' }}
                      >
                        {t.priority}
                      </span>
                    </div>

                    {t.description && (
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
                        {t.description}
                      </p>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleRemind(t.title, t.owner)}
                    >
                      <Bell size={12} />
                      <span>Remind</span>
                    </button>

                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => onUpdateTaskStatus(t.id, 'Completed')}
                      style={{ backgroundColor: 'var(--status-completed)' }}
                    >
                      <CheckCircle2 size={13} />
                      <span>Mark Done</span>
                    </button>
                  </div>
                </div>

                {/* Overdue Metadata Details */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '8px',
                    borderTop: '1px solid var(--border-light)',
                    flexWrap: 'wrap',
                    gap: '10px',
                    fontSize: '11.5px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span>Owner: <strong>{t.owner}</strong></span>
                    <span>Target: <strong style={{ color: 'var(--overdue-coral)' }}>{formatDate(t.deadline)}</strong></span>
                    <span>Status: <strong style={{ color: 'var(--status-pending)' }}>{t.status}</strong></span>
                  </div>

                  <button
                    onClick={() => handleOpenMeeting(t.meetingId)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      color: 'var(--primary-dark)',
                      fontSize: '11.5px',
                      fontWeight: 600
                    }}
                    title="View meeting where this commitment was made"
                  >
                    <span>Origin: {t.meetingTitle || 'Meeting'}</span>
                    <ExternalLink size={11} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
