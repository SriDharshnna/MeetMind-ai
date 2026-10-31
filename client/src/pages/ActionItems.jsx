import React, { useState } from 'react';
import {
  CheckSquare,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Calendar,
  ExternalLink
} from 'lucide-react';
import { formatDate, getDeadlineMeta } from '../utils/helpers';

export default function ActionItems({
  tasks,
  onUpdateTaskStatus,
  setActivePage,
  setSelectedMeetingId,
  globalSearch = ''
}) {
  const [searchQuery, setSearchQuery] = useState(globalSearch || '');
  const [statusFilter, setStatusFilter] = useState('All');
  const [ownerFilter, setOwnerFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');

  // Counts based directly on current tasks
  const totalTasks = tasks.length;
  const pendingCount = tasks.filter((t) => t.status === 'Pending').length;
  const inProgressCount = tasks.filter((t) => t.status === 'In Progress').length;
  const completedCount = tasks.filter((t) => t.status === 'Completed').length;
  const overdueCount = tasks.filter((t) => t.isOverdue).length;

  const ownersList = Array.from(new Set(tasks.map((t) => t.owner))).filter(Boolean);

  const filteredTasks = tasks.filter((t) => {
    const q = (searchQuery || '').toLowerCase();
    const matchesSearch =
      !q ||
      t.title.toLowerCase().includes(q) ||
      t.owner.toLowerCase().includes(q) ||
      (t.meetingTitle && t.meetingTitle.toLowerCase().includes(q));

    let matchesStatus = true;
    if (statusFilter === 'Overdue') {
      matchesStatus = t.isOverdue;
    } else if (statusFilter !== 'All') {
      matchesStatus = t.status === statusFilter;
    }

    const matchesOwner = ownerFilter === 'All' || t.owner === ownerFilter;
    const matchesPriority = priorityFilter === 'All' || t.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesOwner && matchesPriority;
  });

  const handleStatusChange = (taskId, newStatus) => {
    if (onUpdateTaskStatus) {
      onUpdateTaskStatus(taskId, newStatus);
    }
  };

  const handleOpenMeeting = (meetingId) => {
    if (meetingId) {
      setSelectedMeetingId(meetingId);
      setActivePage('meeting-minutes');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 5 Summary Metric Pills */}
      <div className="grid-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))' }}>
        <div
          className="kpi-card"
          onClick={() => setStatusFilter('All')}
          style={{ cursor: 'pointer', padding: '14px' }}
        >
          <span className="kpi-label">Total Commitments</span>
          <div className="kpi-value" style={{ fontSize: '22px' }}>{totalTasks}</div>
        </div>

        <div
          className="kpi-card pending"
          onClick={() => setStatusFilter('Pending')}
          style={{ cursor: 'pointer', padding: '14px' }}
        >
          <span className="kpi-label">Pending</span>
          <div className="kpi-value" style={{ fontSize: '22px', color: 'var(--status-pending)' }}>
            {pendingCount}
          </div>
        </div>

        <div
          className="kpi-card"
          onClick={() => setStatusFilter('In Progress')}
          style={{ cursor: 'pointer', padding: '14px' }}
        >
          <span className="kpi-label">In Progress</span>
          <div className="kpi-value" style={{ fontSize: '22px', color: 'var(--status-progress)' }}>
            {inProgressCount}
          </div>
        </div>

        <div
          className="kpi-card completed"
          onClick={() => setStatusFilter('Completed')}
          style={{ cursor: 'pointer', padding: '14px' }}
        >
          <span className="kpi-label">Completed</span>
          <div className="kpi-value" style={{ fontSize: '22px', color: 'var(--status-completed)' }}>
            {completedCount}
          </div>
        </div>

        <div
          className="kpi-card overdue"
          onClick={() => setStatusFilter('Overdue')}
          style={{ cursor: 'pointer', padding: '14px' }}
        >
          <span className="kpi-label">Overdue</span>
          <div className="kpi-value" style={{ fontSize: '22px', color: 'var(--overdue-coral)' }}>
            {overdueCount}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
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
        <div className="search-box" style={{ display: 'flex', width: '100%', maxWidth: '280px' }}>
          <Search size={15} color="var(--text-secondary)" />
          <input
            type="text"
            className="search-input"
            placeholder="Search action items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          {/* Status filter */}
          <select
            className="form-select"
            style={{ width: 'auto', padding: '6px 10px', fontSize: '12.5px' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Overdue">Overdue</option>
          </select>

          {/* Owner filter */}
          <select
            className="form-select"
            style={{ width: 'auto', padding: '6px 10px', fontSize: '12.5px' }}
            value={ownerFilter}
            onChange={(e) => setOwnerFilter(e.target.value)}
          >
            <option value="All">All Owners</option>
            {ownersList.map((owner) => (
              <option key={owner} value={owner}>
                {owner}
              </option>
            ))}
          </select>

          {/* Priority filter */}
          <select
            className="form-select"
            style={{ width: 'auto', padding: '6px 10px', fontSize: '12.5px' }}
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="All">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {(statusFilter !== 'All' || ownerFilter !== 'All' || priorityFilter !== 'All' || searchQuery) && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => {
                setStatusFilter('All');
                setOwnerFilter('All');
                setPriorityFilter('All');
                setSearchQuery('');
              }}
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Task Table */}
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th style={{ minWidth: '240px' }}>Task Title</th>
              <th>Owner</th>
              <th>Meeting Reference</th>
              <th>Deadline</th>
              <th>Priority</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Quick Toggle</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-secondary)' }}>
                  No commitments match your current filter.
                </td>
              </tr>
            ) : (
              filteredTasks.map((t) => {
                const tId = t._id || t.id;
                const meta = getDeadlineMeta(t.deadline, t.status);
                const mRefId = t.meetingId?._id || t.meetingId;
                return (
                  <tr key={tId}>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '13.5px' }}>
                          {t.title}
                        </span>
                        {t.description && (
                          <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)', lineHeight: 1.3 }}>
                            {t.description}
                          </span>
                        )}
                      </div>
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div
                          className="user-avatar"
                          style={{
                            width: '24px',
                            height: '24px',
                            fontSize: '10px',
                            backgroundColor: t.ownerAvatar === 'RS' ? '#426B50' : '#8DAF91'
                          }}
                        >
                          {t.ownerAvatar || (t.owner ? t.owner.slice(0, 2).toUpperCase() : 'TM')}
                        </div>
                        <span style={{ fontSize: '12.5px', fontWeight: 500, color: 'var(--text-main)' }}>
                          {t.owner}
                        </span>
                      </div>
                    </td>

                    <td>
                      <button
                        onClick={() => handleOpenMeeting(mRefId)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          color: 'var(--primary-dark)',
                          fontSize: '12px',
                          fontWeight: 500,
                          textAlign: 'left'
                        }}
                        title={`View ${t.meetingTitle || 'meeting'}`}
                      >
                        <span style={{ maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {t.meetingTitle || 'Meeting'}
                        </span>
                        <ExternalLink size={11} />
                      </button>
                    </td>

                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontSize: '12.5px', fontWeight: 500, color: meta.isOverdue ? 'var(--overdue-coral)' : 'var(--text-main)' }}>
                          {formatDate(t.deadline)}
                        </span>
                        {meta.isOverdue ? (
                          <span className="badge badge-overdue" style={{ fontSize: '10px', padding: '1px 5px' }}>
                            {meta.label}
                          </span>
                        ) : t.status !== 'Completed' && meta.label ? (
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                            {meta.label}
                          </span>
                        ) : null}
                      </div>
                    </td>

                    <td>
                      <span
                        className={`badge ${
                          t.priority === 'High' ? 'badge-amber' : t.priority === 'Medium' ? 'badge-sage' : 'badge-pending'
                        }`}
                        style={{ fontSize: '10.5px' }}
                      >
                        {t.priority}
                      </span>
                    </td>

                    {/* Interactive Status Selector */}
                    <td>
                      <select
                        className="form-select"
                        style={{
                          width: 'auto',
                          padding: '4px 8px',
                          fontSize: '11.5px',
                          fontWeight: 600,
                          borderRadius: 'var(--radius-pill)',
                          border: meta.isOverdue ? '1px solid var(--overdue-border)' : '1px solid var(--border-color)',
                          backgroundColor:
                            t.status === 'Completed'
                              ? 'var(--status-completed-bg)'
                              : t.status === 'In Progress'
                              ? 'var(--status-progress-bg)'
                              : meta.isOverdue
                              ? 'var(--overdue-bg)'
                              : 'var(--status-pending-bg)',
                          color:
                            t.status === 'Completed'
                              ? 'var(--status-completed)'
                              : t.status === 'In Progress'
                              ? 'var(--status-progress)'
                              : meta.isOverdue
                              ? 'var(--overdue-coral)'
                              : 'var(--status-pending)'
                        }}
                        value={t.status}
                        onChange={(e) => handleStatusChange(tId, e.target.value)}
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => {
                          const nextStatus =
                            t.status === 'Completed'
                              ? 'Pending'
                              : t.status === 'Pending'
                              ? 'In Progress'
                              : 'Completed';
                          handleStatusChange(tId, nextStatus);
                        }}
                        title="Toggle task completion"
                      >
                        {t.status === 'Completed' ? 'Reopen' : 'Mark Done'}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
