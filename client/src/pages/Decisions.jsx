import React, { useState } from 'react';
import {
  ShieldCheck,
  Search,
  Calendar,
  User,
  ExternalLink
} from 'lucide-react';
import { formatDate } from '../utils/helpers';

export default function Decisions({
  decisions,
  onUpdateDecisionStatus,
  setActivePage,
  setSelectedMeetingId,
  globalSearch = ''
}) {
  const [searchTerm, setSearchTerm] = useState(globalSearch || '');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const categories = Array.from(new Set(decisions.map((d) => d.category))).filter(Boolean);

  const filteredDecisions = decisions.filter((d) => {
    const q = (searchTerm || '').toLowerCase();
    const matchesSearch =
      !q ||
      d.title.toLowerCase().includes(q) ||
      d.description.toLowerCase().includes(q) ||
      (d.owner && d.owner.toLowerCase().includes(q)) ||
      (d.meetingTitle && d.meetingTitle.toLowerCase().includes(q));

    const matchesStatus = statusFilter === 'All' || d.status === statusFilter;
    const matchesCategory = categoryFilter === 'All' || d.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleOpenMeeting = (meetingId) => {
    if (meetingId) {
      setSelectedMeetingId(meetingId);
      setActivePage('meeting-minutes');
    }
  };

  const handleStatusChange = (decisionId, newStatus) => {
    if (onUpdateDecisionStatus) {
      onUpdateDecisionStatus(decisionId, newStatus);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Info */}
      <div
        className="card card-light-sage"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          padding: '16px 22px'
        }}
      >
        <div>
          <h2 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--primary-dark)', margin: 0 }}>
            Organizational & Architecture Decision Log
          </h2>
          <span style={{ fontSize: '12px', color: 'var(--text-main)' }}>
            Track commitments and decisions to implementation to prevent repeating settled topics.
          </span>
        </div>
        <span className="badge badge-completed" style={{ padding: '5px 10px', fontSize: '12px' }}>
          {decisions.length} Decisions Logged
        </span>
      </div>

      {/* Search & Filters */}
      <div
        className="card"
        style={{
          padding: '14px 18px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px'
        }}
      >
        <div className="search-box" style={{ display: 'flex', width: '100%', maxWidth: '320px' }}>
          <Search size={15} color="var(--text-secondary)" />
          <input
            type="text"
            className="search-input"
            placeholder="Search decisions, champions, meetings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <select
            className="form-select"
            style={{ width: 'auto', padding: '6px 12px', fontSize: '12.5px' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Decided">Decided</option>
            <option value="In Progress">In Progress</option>
            <option value="Implemented">Implemented</option>
          </select>

          <select
            className="form-select"
            style={{ width: 'auto', padding: '6px 12px', fontSize: '12.5px' }}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="All">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Decisions Cards List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {filteredDecisions.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '36px' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>No decisions match your current filter.</p>
          </div>
        ) : (
          filteredDecisions.map((d) => (
            <div
              key={d.id}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <ShieldCheck size={18} color="var(--primary-dark)" />
                  <h3 style={{ fontSize: '15.5px', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                    {d.title}
                  </h3>

                  {d.category && (
                    <span className="badge badge-sage" style={{ fontSize: '10.5px' }}>
                      {d.category}
                    </span>
                  )}
                </div>

                {/* Status selector allowing status updates */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <select
                    className="form-select"
                    style={{
                      width: 'auto',
                      padding: '4px 10px',
                      fontSize: '12px',
                      fontWeight: 600,
                      borderRadius: 'var(--radius-pill)',
                      backgroundColor:
                        d.status === 'Implemented'
                          ? 'var(--status-completed-bg)'
                          : d.status === 'In Progress'
                          ? 'var(--status-progress-bg)'
                          : 'var(--bg-main)',
                      color:
                        d.status === 'Implemented'
                          ? 'var(--status-completed)'
                          : d.status === 'In Progress'
                          ? 'var(--status-progress)'
                          : 'var(--text-main)'
                    }}
                    value={d.status}
                    onChange={(e) => handleStatusChange(d.id, e.target.value)}
                  >
                    <option value="Decided">Decided</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Implemented">Implemented</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <p style={{ fontSize: '12.5px', color: 'var(--text-main)', lineHeight: 1.5, margin: 0 }}>
                {d.description}
              </p>

              {d.rationale && (
                <div
                  style={{
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg-main)',
                    borderLeft: '3px solid var(--primary-sage)',
                    fontSize: '11.5px',
                    color: 'var(--text-secondary)'
                  }}
                >
                  <strong>Context:</strong> {d.rationale}
                </div>
              )}

              {/* Footer */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '8px',
                  borderTop: '1px solid var(--border-light)',
                  fontSize: '11.5px',
                  color: 'var(--text-secondary)',
                  flexWrap: 'wrap',
                  gap: '8px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <span>Champion: <strong>{d.owner || 'Team'}</strong></span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={12} />
                    {formatDate(d.date)}
                  </span>
                </div>

                <button
                  onClick={() => handleOpenMeeting(d.meetingId)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    color: 'var(--primary-dark)',
                    fontSize: '12px',
                    fontWeight: 600
                  }}
                  title="View originating meeting minutes"
                >
                  <span>Meeting: {d.meetingTitle || 'View Record'}</span>
                  <ExternalLink size={11} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
