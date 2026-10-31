import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Meetings from './pages/Meetings';
import CreateMeeting from './pages/CreateMeeting';
import MeetingMinutes from './pages/MeetingMinutes';
import ActionItems from './pages/ActionItems';
import Decisions from './pages/Decisions';
import OverdueTasks from './pages/OverdueTasks';
import AiFollowup from './pages/AiFollowup';
import Settings from './pages/Settings';
import * as api from './services/api';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Backend Data State
  const [meetings, setMeetings] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [decisions, setDecisions] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [selectedMeetingId, setSelectedMeetingId] = useState(null);

  // Loading & Error States
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  // Load all data from Backend MongoDB APIs
  const loadBackendData = useCallback(async () => {
    try {
      setLoading(true);
      setApiError(null);

      const [meetingsData, tasksData, decisionsData, statsData] = await Promise.all([
        api.getMeetings(),
        api.getTasks(),
        api.getDecisions(),
        api.getDashboardStats()
      ]);

      setMeetings(meetingsData);
      setTasks(tasksData);
      setDecisions(decisionsData);
      setDashboardStats(statsData);

      if (meetingsData.length > 0 && !selectedMeetingId) {
        setSelectedMeetingId(meetingsData[0]._id || meetingsData[0].id);
      }
    } catch (err) {
      console.error('[App] Failed to load data from backend:', err);
      setApiError('Unable to connect to MeetMind AI backend server (http://localhost:5000). Ensure the Node.js server and MongoDB are running.');
    } finally {
      setLoading(false);
    }
  }, [selectedMeetingId]);

  useEffect(() => {
    loadBackendData();
  }, [loadBackendData]);

  // Tasks with dynamic isOverdue calculated by backend virtual or client fallback
  const tasksWithOverdue = tasks.map((t) => ({
    ...t,
    id: t._id || t.id,
    meetingId: t.meetingId?._id || t.meetingId || '',
    isOverdue: t.status === 'Completed' ? false : (t.isOverdue || false)
  }));

  // Dynamic overdue count from actual state
  const overdueCount = tasksWithOverdue.filter((t) => t.isOverdue).length;

  // Task status transition handler -> calls backend PUT /api/tasks/:id
  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      // Optimistic update
      setTasks((prev) =>
        prev.map((t) =>
          (t._id === taskId || t.id === taskId)
            ? { ...t, status: newStatus, isOverdue: newStatus === 'Completed' ? false : t.isOverdue }
            : t
        )
      );

      const updated = await api.updateTask(taskId, { status: newStatus });

      // Refresh dashboard stats in background
      api.getDashboardStats().then(setDashboardStats).catch(console.error);
    } catch (err) {
      console.error('Failed to update task status:', err);
      alert('Failed to update task status on backend: ' + err.message);
      loadBackendData();
    }
  };

  // Decision status transition handler -> calls backend PUT /api/decisions/:id
  const handleUpdateDecisionStatus = async (decisionId, newStatus) => {
    try {
      setDecisions((prev) =>
        prev.map((d) =>
          (d._id === decisionId || d.id === decisionId)
            ? { ...d, implementationStatus: newStatus }
            : d
        )
      );

      await api.updateDecision(decisionId, { implementationStatus: newStatus });
      api.getDashboardStats().then(setDashboardStats).catch(console.error);
    } catch (err) {
      console.error('Failed to update decision status:', err);
      alert('Failed to update decision status: ' + err.message);
      loadBackendData();
    }
  };

  // Add new analyzed meeting -> calls backend POST /api/meetings
  const handleAddMeeting = async ({ meeting, tasks: newTasks, decisions: newDecisions }) => {
    try {
      setLoading(true);

      const payload = {
        title: meeting.title,
        date: meeting.date,
        time: meeting.time,
        duration: meeting.duration,
        participants: meeting.participants,
        transcript: meeting.rawNotes || meeting.transcript,
        summary: meeting.summary,
        discussionPoints: meeting.discussionPoints,
        status: meeting.status.includes('Approved') ? 'Approved' : 'Draft',
        extractedTasks: newTasks,
        extractedDecisions: newDecisions
      };

      const result = await api.createMeeting(payload);
      const createdMeeting = result.data;

      setSelectedMeetingId(createdMeeting._id);
      await loadBackendData();
      setActivePage('meeting-minutes');
    } catch (err) {
      console.error('Failed to save meeting to backend:', err);
      alert('Failed to save meeting to database: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Approve meeting handler -> calls backend PUT /api/meetings/:id
  const handleApproveMeeting = async (meetingId) => {
    try {
      setMeetings((prev) =>
        prev.map((m) =>
          (m._id === meetingId || m.id === meetingId) ? { ...m, status: 'Approved' } : m
        )
      );

      await api.updateMeeting(meetingId, { status: 'Approved' });
      api.getDashboardStats().then(setDashboardStats).catch(console.error);
    } catch (err) {
      console.error('Failed to approve meeting:', err);
      alert('Failed to approve meeting: ' + err.message);
    }
  };

  // Reset demo data handler
  const handleResetData = async () => {
    await loadBackendData();
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        overdueCount={overdueCount}
      />

      {/* Main Content Area */}
      <div className="app-main">
        <Header
          activePage={activePage}
          setActivePage={setActivePage}
          setIsMobileOpen={setIsMobileOpen}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        {/* Global Connection Error Banner if Backend is Unreachable */}
        {apiError && (
          <div
            style={{
              margin: '16px 32px 0 32px',
              padding: '12px 18px',
              backgroundColor: 'var(--overdue-bg)',
              border: '1px solid var(--overdue-border)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <AlertCircle size={18} color="var(--overdue-coral)" />
              <span style={{ fontSize: '13px', color: 'var(--text-main)', fontWeight: 500 }}>
                {apiError}
              </span>
            </div>
            <button
              className="btn btn-secondary btn-sm"
              onClick={loadBackendData}
            >
              <RefreshCw size={13} />
              <span>Retry Connection</span>
            </button>
          </div>
        )}

        <main className="page-content">
          {loading && meetings.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
              <RefreshCw size={28} className="animate-spin" color="var(--primary-dark)" style={{ margin: '0 auto 12px auto' }} />
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-main)' }}>
                Connecting to MeetMind AI Database...
              </h3>
              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                Loading persistent meetings, deliverables, and architecture decisions.
              </p>
            </div>
          ) : (
            <>
              {activePage === 'dashboard' && (
                <Dashboard
                  meetings={meetings}
                  tasks={tasksWithOverdue}
                  decisions={decisions}
                  dashboardStats={dashboardStats}
                  setActivePage={setActivePage}
                  setSelectedMeetingId={setSelectedMeetingId}
                />
              )}

              {activePage === 'meetings' && (
                <Meetings
                  meetings={meetings}
                  setActivePage={setActivePage}
                  setSelectedMeetingId={setSelectedMeetingId}
                  globalSearch={searchQuery}
                />
              )}

              {activePage === 'create-meeting' && (
                <CreateMeeting
                  onAddMeeting={handleAddMeeting}
                  setActivePage={setActivePage}
                  setSelectedMeetingId={setSelectedMeetingId}
                />
              )}

              {activePage === 'meeting-minutes' && (
                <MeetingMinutes
                  meetings={meetings}
                  selectedMeetingId={selectedMeetingId}
                  setSelectedMeetingId={setSelectedMeetingId}
                  onApproveMeeting={handleApproveMeeting}
                  tasks={tasksWithOverdue}
                  decisions={decisions}
                  onUpdateTaskStatus={handleUpdateTaskStatus}
                  onUpdateDecisionStatus={handleUpdateDecisionStatus}
                />
              )}

              {activePage === 'action-items' && (
                <ActionItems
                  tasks={tasksWithOverdue}
                  onUpdateTaskStatus={handleUpdateTaskStatus}
                  setActivePage={setActivePage}
                  setSelectedMeetingId={setSelectedMeetingId}
                  globalSearch={searchQuery}
                />
              )}

              {activePage === 'decisions' && (
                <Decisions
                  decisions={decisions}
                  onUpdateDecisionStatus={handleUpdateDecisionStatus}
                  setActivePage={setActivePage}
                  setSelectedMeetingId={setSelectedMeetingId}
                  globalSearch={searchQuery}
                />
              )}

              {activePage === 'overdue-tasks' && (
                <OverdueTasks
                  tasks={tasksWithOverdue}
                  onUpdateTaskStatus={handleUpdateTaskStatus}
                  setActivePage={setActivePage}
                  setSelectedMeetingId={setSelectedMeetingId}
                />
              )}

              {activePage === 'ai-followup' && (
                <AiFollowup
                  tasks={tasksWithOverdue}
                  decisions={decisions}
                  meetings={meetings}
                  setActivePage={setActivePage}
                  setSelectedMeetingId={setSelectedMeetingId}
                />
              )}

              {activePage === 'settings' && (
                <Settings onResetData={handleResetData} />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
