import React, { useState } from 'react';
import {
  Menu,
  Search,
  Bell,
  Plus,
  AlertCircle,
  Sparkles,
  Calendar,
  CheckCircle2
} from 'lucide-react';

const PAGE_META = {
  dashboard: {
    title: 'Dashboard Overview',
    subtitle: "Track meetings, manage commitments, and stay ahead of deadlines."
  },
  meetings: {
    title: 'Meeting Directory',
    subtitle: 'Access past meeting records, summaries, and action plans.'
  },
  'create-meeting': {
    title: 'Create & Analyze Meeting',
    subtitle: 'Enter transcripts or discussion notes for Agentic AI processing.'
  },
  'meeting-minutes': {
    title: 'Minutes of Meeting (MOM)',
    subtitle: 'AI-generated structured minutes, action items, and decisions.'
  },
  'action-items': {
    title: 'Action Items & Deliverables',
    subtitle: 'Track team commitments, assignees, and progress states.'
  },
  decisions: {
    title: 'Decision Log',
    subtitle: 'Persistent record of organizational and architectural decisions.'
  },
  'overdue-tasks': {
    title: 'Overdue Commitments',
    subtitle: 'Critical delayed items requiring managerial intervention.'
  },
  'ai-followup': {
    title: 'AI Follow-up & Agenda Generator',
    subtitle: 'Agentic intelligence synthesizing past meetings into future action.'
  },
  settings: {
    title: 'System Settings',
    subtitle: 'Manage user profile, preferences, and notification rules.'
  }
};

export default function Header({
  activePage,
  setActivePage,
  setIsMobileOpen,
  searchQuery,
  setSearchQuery
}) {
  const [showNotifications, setShowNotifications] = useState(false);
  const currentMeta = PAGE_META[activePage] || {
    title: 'MeetMind AI',
    subtitle: 'Agentic Meeting Intelligence'
  };

  const sampleNotifications = [
    {
      id: 1,
      type: 'overdue',
      icon: AlertCircle,
      title: 'Task Overdue by 4 days',
      text: 'Workspace API Integration Contract assigned to Rahul Sharma is overdue.',
      time: '2 hours ago',
      targetPage: 'overdue-tasks'
    },
    {
      id: 2,
      type: 'agent',
      icon: Sparkles,
      title: 'AI Follow-up Agenda Ready',
      text: 'Agent 4 compiled 5 suggested agenda topics for the next architecture sync.',
      time: '4 hours ago',
      targetPage: 'ai-followup'
    },
    {
      id: 3,
      type: 'meeting',
      icon: Calendar,
      title: 'MOM Approved',
      text: 'Sprint Planning & Core Architecture Review was approved & saved.',
      time: 'Yesterday',
      targetPage: 'meeting-minutes'
    }
  ];

  return (
    <header className="app-header">
      <div className="header-left">
        <button
          className="menu-toggle-btn"
          onClick={() => setIsMobileOpen(true)}
          aria-label="Open navigation menu"
        >
          <Menu size={20} />
        </button>

        <div className="header-title-box">
          <h1 className="page-title">{currentMeta.title}</h1>
          <span className="page-subtitle">{currentMeta.subtitle}</span>
        </div>
      </div>

      <div className="header-right">
        <div className="search-box">
          <Search size={16} color="var(--text-secondary)" />
          <input
            type="text"
            className="search-input"
            placeholder="Search meetings, tasks, decisions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <button
          className="btn btn-primary btn-sm"
          onClick={() => setActivePage('create-meeting')}
          title="Create New Meeting"
        >
          <Plus size={15} />
          <span>New Meeting</span>
        </button>

        <div style={{ position: 'relative' }}>
          <button
            className="icon-button"
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="View notifications"
          >
            <Bell size={18} />
            <span className="notification-dot" />
          </button>

          {showNotifications && (
            <div
              className="card"
              style={{
                position: 'absolute',
                top: '48px',
                right: '0',
                width: '320px',
                padding: '16px',
                boxShadow: 'var(--shadow-modal)',
                zIndex: 200,
                animation: 'scaleUp 0.18s ease'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '12px',
                  borderBottom: '1px solid var(--border-color)',
                  paddingBottom: '8px'
                }}
              >
                <span style={{ fontWeight: 700, fontSize: '13.5px', color: 'var(--text-main)' }}>
                  Notifications
                </span>
                <span className="badge badge-sage">3 New</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {sampleNotifications.map((n) => {
                  const Icon = n.icon;
                  const isOverdue = n.type === 'overdue';
                  return (
                    <div
                      key={n.id}
                      onClick={() => {
                        setActivePage(n.targetPage);
                        setShowNotifications(false);
                      }}
                      style={{
                        padding: '10px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: isOverdue ? 'var(--overdue-bg)' : 'var(--bg-main)',
                        border: isOverdue ? '1px solid var(--overdue-border)' : '1px solid var(--border-color)',
                        cursor: 'pointer',
                        transition: 'transform var(--transition-fast)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                        <Icon size={14} color={isOverdue ? 'var(--overdue-coral)' : 'var(--primary-dark)'} />
                        <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-main)' }}>
                          {n.title}
                        </span>
                      </div>
                      <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                        {n.text}
                      </p>
                      <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                        {n.time}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div
          className="user-avatar"
          style={{ cursor: 'pointer', width: '36px', height: '36px', fontSize: '12px' }}
          onClick={() => setActivePage('settings')}
          title="Sarah Jenkins - Settings"
        >
          SJ
        </div>
      </div>
    </header>
  );
}
