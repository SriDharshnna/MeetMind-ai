import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Plus,
  Search,
  Filter,
  FileText,
  ArrowRight
} from 'lucide-react';
import { formatDate } from '../utils/helpers';

export default function Meetings({
  meetings,
  setActivePage,
  setSelectedMeetingId,
  globalSearch = ''
}) {
  const [searchTerm, setSearchTerm] = useState(globalSearch || '');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All');

  const filteredMeetings = meetings.filter((m) => {
    const q = (searchTerm || '').toLowerCase();
    const matchesSearch =
      !q ||
      m.title.toLowerCase().includes(q) ||
      m.summary.toLowerCase().includes(q) ||
      m.participants.some((p) => p.name.toLowerCase().includes(q));

    const matchesStatus = statusFilter === 'All' || m.status.includes(statusFilter);

    let matchesDate = true;
    if (dateFilter === 'Recent') {
      matchesDate = m.date >= '2026-10-25';
    } else if (dateFilter === 'Earlier') {
      matchesDate = m.date < '2026-10-25';
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  const handleOpenMeeting = (id) => {
    setSelectedMeetingId(id);
    setActivePage('meeting-minutes');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Controls: Search, Filters & Action Button */}
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
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px', flex: 1 }}>
          <div className="search-box" style={{ display: 'flex', width: '100%', maxWidth: '320px' }}>
            <Search size={15} color="var(--text-secondary)" />
            <input
              type="text"
              className="search-input"
              placeholder="Search meetings by title or attendee..."
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
              <option value="Approved">Approved</option>
              <option value="Draft">Draft</option>
            </select>

            <select
              className="form-select"
              style={{ width: 'auto', padding: '6px 12px', fontSize: '12.5px' }}
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            >
              <option value="All">All Dates</option>
              <option value="Recent">Recent (Last 7 Days)</option>
              <option value="Earlier">Earlier</option>
            </select>
          </div>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => setActivePage('create-meeting')}
        >
          <Plus size={15} />
          <span>Create New Meeting</span>
        </button>
      </div>

      {/* Meeting Cards List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {filteredMeetings.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '42px 20px' }}>
            <FileText size={32} color="var(--text-muted)" style={{ margin: '0 auto 10px auto' }} />
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
              No meetings matched your criteria
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '12.5px', marginBottom: '14px' }}>
              Try adjusting your search query or date filter.
            </p>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('All');
                setDateFilter('All');
              }}
            >
              Clear Filters
            </button>
          </div>
        ) : (
          filteredMeetings.map((m) => {
            const mId = m._id || m.id;
            return (
              <div
                key={mId}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '14px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)' }}>
                        {m.title}
                      </h3>
                      <span
                        className={`badge ${
                          m.status === 'Approved' ? 'badge-completed' : 'badge-amber'
                        }`}
                      >
                        {m.status}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Calendar size={13} color="var(--primary-dark)" />
                        {formatDate(m.date)}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Clock size={13} color="var(--primary-dark)" />
                        {m.time}
                      </span>
                    </div>
                  </div>

                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleOpenMeeting(mId)}
                  >
                    <span>View Details</span>
                    <ArrowRight size={13} />
                  </button>
                </div>

              {/* Summary Preview */}
              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {m.summary}
              </p>

              {/* Card Footer: Attendees & Action items count */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '10px',
                  borderTop: '1px solid var(--border-light)',
                  flexWrap: 'wrap',
                  gap: '10px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontWeight: 500 }}>
                    Participants:
                  </span>
                  <div className="avatar-group">
                    {m.participants.map((p, i) => (
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
                  <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                    {m.participants.map((p) => p.name.split(' ')[0]).join(', ')}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="badge badge-sage">
                    {m.actionItemsCount || 0} Action Items
                  </span>
                  <span className="badge badge-sage">
                    {m.decisionsCount || 0} Decisions
                  </span>
                </div>
              </div>
            </div>
            );
          })
        )}
      </div>
    </div>
  );
}
