import React from 'react';
import {
  LayoutDashboard,
  CalendarDays,
  PlusCircle,
  FileText,
  CheckSquare,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  Settings,
  Brain,
  X
} from 'lucide-react';

export default function Sidebar({
  activePage,
  setActivePage,
  isMobileOpen,
  setIsMobileOpen,
  overdueCount = 3
}) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'meetings', label: 'Meetings', icon: CalendarDays },
    { id: 'create-meeting', label: 'Create Meeting', icon: PlusCircle },
    { id: 'meeting-minutes', label: 'Meeting Minutes', icon: FileText },
    { id: 'action-items', label: 'Action Items', icon: CheckSquare },
    { id: 'decisions', label: 'Decisions', icon: ShieldCheck },
    {
      id: 'overdue-tasks',
      label: 'Overdue Tasks',
      icon: AlertTriangle,
      badge: overdueCount,
      isDangerBadge: true
    },
    {
      id: 'ai-followup',
      label: 'AI Follow-up',
      icon: Sparkles,
      badge: 'Agentic'
    },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const handleNavClick = (pageId) => {
    setActivePage(pageId);
    if (isMobileOpen) {
      setIsMobileOpen(false);
    }
  };

  return (
    <>
      <aside className={`app-sidebar ${isMobileOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-brand" onClick={() => handleNavClick('dashboard')} style={{ cursor: 'pointer' }}>
            <div className="logo-icon">
              <Brain size={22} strokeWidth={2.2} />
            </div>
            <div className="brand-text-wrapper">
              <div className="brand-title">
                MeetMind <span className="brand-badge">AI</span>
              </div>
              <span className="brand-subtitle">Meeting Intelligence</span>
            </div>
          </div>
          {isMobileOpen && (
            <button
              className="menu-toggle-btn"
              onClick={() => setIsMobileOpen(false)}
              aria-label="Close sidebar"
            >
              <X size={18} />
            </button>
          )}
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Navigation</div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => handleNavClick(item.id)}
              >
                <Icon size={18} className="nav-icon" />
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className={`nav-badge ${item.isDangerBadge ? 'danger' : ''}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div
            className="user-profile-widget"
            onClick={() => handleNavClick('settings')}
            style={{ cursor: 'pointer' }}
          >
            <div className="user-avatar">SJ</div>
            <div className="user-meta">
              <span className="user-name">Sarah Jenkins</span>
              <span className="user-role">Head of Product</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Backdrop for mobile drawer */}
      {isMobileOpen && (
        <div
          className="modal-overlay"
          style={{ zIndex: 95 }}
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  );
}
