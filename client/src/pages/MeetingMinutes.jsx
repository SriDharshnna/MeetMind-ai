import React, { useState } from 'react';
import {
  FileText,
  Calendar,
  Clock,
  CheckCircle2,
  Users,
  ShieldCheck,
  CheckSquare,
  Sparkles,
  Save,
  Share2
} from 'lucide-react';
import { formatDate } from '../utils/helpers';

export default function MeetingMinutes({
  meetings,
  selectedMeetingId,
  setSelectedMeetingId,
  onApproveMeeting,
  tasks,
  decisions,
  onUpdateTaskStatus,
  onUpdateDecisionStatus
}) {
  const [toastMessage, setToastMessage] = useState('');

  // Find currently selected meeting or default to first
  const currentMeeting =
    meetings.find((m) => (m._id || m.id) === selectedMeetingId) || meetings[0];

  const currentMeetingId = currentMeeting ? (currentMeeting._id || currentMeeting.id) : null;

  // Associated tasks for this meeting
  const meetingTasks = tasks.filter(
    (t) => (t.meetingId?._id || t.meetingId) === currentMeetingId
  );

  // Associated decisions
  const meetingDecisions = decisions.filter(
    (d) => (d.meetingId?._id || d.meetingId) === currentMeetingId
  );

  const handleApprove = () => {
    if (onApproveMeeting && currentMeeting) {
      onApproveMeeting(currentMeeting._id || currentMeeting.id);
    }
    setToastMessage('Meeting minutes and extracted action items approved and saved.');
    setTimeout(() => {
      setToastMessage('');
    }, 3000);
  };

  if (!currentMeeting) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
        <p style={{ color: 'var(--text-secondary)' }}>No meeting record selected.</p>
      </div>
    );
  }

  const isApproved = currentMeeting.status === 'Approved';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="toast-notice">
          <CheckCircle2 size={18} color="var(--primary-dark)" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Selector & Approval Action */}
      <div
        className="card"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          padding: '14px 20px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
            Select Meeting:
          </span>
          <select
            className="form-select"
            style={{ width: 'auto', minWidth: '300px', padding: '7px 12px', fontWeight: 600, fontSize: '13px' }}
            value={currentMeeting._id || currentMeeting.id}
            onChange={(e) => setSelectedMeetingId(e.target.value)}
          >
            {meetings.map((m) => {
              const mId = m._id || m.id;
              return (
                <option key={mId} value={mId}>
                  {m.title} ({formatDate(m.date)})
                </option>
              );
            })}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => {
              setToastMessage('MOM summary link copied to clipboard.');
              setTimeout(() => setToastMessage(''), 2500);
            }}
          >
            <Share2 size={14} />
            <span>Share</span>
          </button>

          <button
            className="btn btn-primary"
            onClick={handleApprove}
            disabled={isApproved}
            style={{
              backgroundColor: isApproved ? 'var(--status-completed)' : 'var(--primary-dark)',
              cursor: isApproved ? 'default' : 'pointer'
            }}
          >
            <Save size={15} />
            <span>{isApproved ? 'Approved & Locked' : 'Approve & Save Records'}</span>
          </button>
        </div>
      </div>

      {/* Meeting Header */}
      <div className="card" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <h2 style={{ fontSize: '19px', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                {currentMeeting.title}
              </h2>
              <span
                className={`badge ${
                  isApproved ? 'badge-completed' : 'badge-amber'
                }`}
              >
                {currentMeeting.status}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '18px', color: 'var(--text-secondary)', fontSize: '12.5px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Calendar size={13} color="var(--primary-dark)" />
                {formatDate(currentMeeting.date)}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Clock size={13} color="var(--primary-dark)" />
                {currentMeeting.time}
              </span>
            </div>
          </div>

          {/* Attendees */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
            <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontWeight: 600 }}>
              Attendees ({currentMeeting.participants.length})
            </span>
            <div className="avatar-group">
              {currentMeeting.participants.map((p, i) => (
                <div
                  key={i}
                  className="avatar-item"
                  style={{ backgroundColor: p.color || 'var(--primary-sage)' }}
                  title={`${p.name} - ${p.role}`}
                >
                  {p.avatar}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* AI-Generated Summary Section */}
      <div className="card card-light-sage" style={{ padding: '18px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Sparkles size={16} color="var(--primary-dark)" />
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--primary-dark)', margin: 0 }}>
            Minutes of Meeting – Executive Summary
          </h3>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-main)', lineHeight: 1.6 }}>
          {currentMeeting.summary}
        </p>
      </div>

      {/* Key Discussion Points */}
      <div className="card">
        <h3 className="card-title" style={{ marginBottom: '14px' }}>
          <FileText size={16} color="var(--primary-dark)" />
          Key Discussion Points
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {currentMeeting.discussionPoints?.map((item, idx) => (
            <div
              key={idx}
              style={{
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-main)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                gap: '3px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>
                  {item.topic}
                </span>
                <span className="badge badge-sage" style={{ fontSize: '10.5px' }}>
                  Speaker: {item.speaker}
                </span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {item.notes}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Extracted Action Items & Decisions in 2 Columns */}
      <div className="grid-2">
        {/* Extracted Action Items */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <CheckSquare size={16} color="var(--primary-dark)" />
              Extracted Action Items
            </h3>
            <span className="badge badge-sage">
              {meetingTasks.length} Tasks
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {meetingTasks.length === 0 ? (
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>No action items recorded.</p>
            ) : (
              meetingTasks.map((t) => (
                <div
                  key={t.id}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: t.isOverdue ? 'var(--overdue-bg)' : 'var(--bg-main)',
                    border: t.isOverdue ? '1px solid var(--overdue-border)' : '1px solid var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-main)' }}>
                      {t.title}
                    </span>
                    <select
                      className="form-select"
                      style={{ width: 'auto', padding: '2px 8px', fontSize: '11px', fontWeight: 600 }}
                      value={t.status}
                      onChange={(e) => onUpdateTaskStatus && onUpdateTaskStatus(t.id, e.target.value)}
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                    <span>Owner: <strong>{t.owner}</strong></span>
                    <span>Deadline: <strong>{t.deadline}</strong></span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recorded Decisions */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <ShieldCheck size={16} color="var(--primary-dark)" />
              Decisions Made
            </h3>
            <span className="badge badge-sage">
              {meetingDecisions.length} Decisions
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {meetingDecisions.length === 0 ? (
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>No decisions recorded for this meeting.</p>
            ) : (
              meetingDecisions.map((d) => (
                <div
                  key={d.id}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-main)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-main)' }}>
                      {d.title}
                    </span>
                    <select
                      className="form-select"
                      style={{ width: 'auto', padding: '2px 8px', fontSize: '11px', fontWeight: 600 }}
                      value={d.status}
                      onChange={(e) => onUpdateDecisionStatus && onUpdateDecisionStatus(d.id, e.target.value)}
                    >
                      <option value="Decided">Decided</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Implemented">Implemented</option>
                    </select>
                  </div>
                  <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
                    {d.description}
                  </p>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Champion: <strong>{d.owner}</strong>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
