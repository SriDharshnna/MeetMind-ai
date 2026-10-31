import React, { useState, useEffect } from 'react';
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
import {
  INITIAL_MEETINGS,
  INITIAL_TASKS,
  INITIAL_DECISIONS
} from './data/mockData';
import { loadFromStorage, saveToStorage } from './utils/storage';
import { isTaskOverdue } from './utils/helpers';

export default function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // LocalStorage Persistent State
  const [meetings, setMeetings] = useState(() =>
    loadFromStorage('meetmind_meetings', INITIAL_MEETINGS)
  );

  const [tasks, setTasks] = useState(() =>
    loadFromStorage('meetmind_tasks', INITIAL_TASKS)
  );

  const [decisions, setDecisions] = useState(() =>
    loadFromStorage('meetmind_decisions', INITIAL_DECISIONS)
  );

  const [selectedMeetingId, setSelectedMeetingId] = useState(() => {
    const saved = loadFromStorage('meetmind_selectedMeetingId', null);
    return saved || (INITIAL_MEETINGS[0]?.id || 'meet-101');
  });

  // Sync to localStorage
  useEffect(() => {
    saveToStorage('meetmind_meetings', meetings);
  }, [meetings]);

  useEffect(() => {
    saveToStorage('meetmind_tasks', tasks);
  }, [tasks]);

  useEffect(() => {
    saveToStorage('meetmind_decisions', decisions);
  }, [decisions]);

  useEffect(() => {
    saveToStorage('meetmind_selectedMeetingId', selectedMeetingId);
  }, [selectedMeetingId]);

  // Compute dynamic overdue state for all tasks
  // (Tasks with status 'Completed' are NEVER overdue!)
  const tasksWithDynamicOverdue = tasks.map((t) => ({
    ...t,
    isOverdue: isTaskOverdue(t)
  }));

  // Dynamic overdue count
  const overdueCount = tasksWithDynamicOverdue.filter((t) => t.isOverdue).length;

  // Task status transition handler
  const handleUpdateTaskStatus = (taskId, newStatus) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === taskId) {
          const updated = {
            ...task,
            status: newStatus
          };
          return {
            ...updated,
            isOverdue: isTaskOverdue(updated)
          };
        }
        return task;
      })
    );
  };

  // Decision status transition handler
  const handleUpdateDecisionStatus = (decisionId, newStatus) => {
    setDecisions((prev) =>
      prev.map((dec) =>
        dec.id === decisionId ? { ...dec, status: newStatus } : dec
      )
    );
  };

  // Add new analyzed meeting and its extracted tasks/decisions
  const handleAddMeeting = ({ meeting, tasks: newTasks, decisions: newDecisions }) => {
    setMeetings((prev) => [meeting, ...prev]);
    if (newTasks && newTasks.length > 0) {
      setTasks((prev) => [...newTasks, ...prev]);
    }
    if (newDecisions && newDecisions.length > 0) {
      setDecisions((prev) => [...newDecisions, ...prev]);
    }
    setSelectedMeetingId(meeting.id);
  };

  // Approve meeting handler
  const handleApproveMeeting = (meetingId) => {
    setMeetings((prev) =>
      prev.map((m) =>
        m.id === meetingId ? { ...m, status: 'Approved' } : m
      )
    );
  };

  // Reset to initial mock data
  const handleResetData = () => {
    setMeetings(INITIAL_MEETINGS);
    setTasks(INITIAL_TASKS);
    setDecisions(INITIAL_DECISIONS);
    setSelectedMeetingId(INITIAL_MEETINGS[0].id);
    window.localStorage.removeItem('meetmind_meetings');
    window.localStorage.removeItem('meetmind_tasks');
    window.localStorage.removeItem('meetmind_decisions');
    window.localStorage.removeItem('meetmind_selectedMeetingId');
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

        <main className="page-content">
          {activePage === 'dashboard' && (
            <Dashboard
              meetings={meetings}
              tasks={tasksWithDynamicOverdue}
              decisions={decisions}
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
              tasks={tasksWithDynamicOverdue}
              decisions={decisions}
              onUpdateTaskStatus={handleUpdateTaskStatus}
              onUpdateDecisionStatus={handleUpdateDecisionStatus}
            />
          )}

          {activePage === 'action-items' && (
            <ActionItems
              tasks={tasksWithDynamicOverdue}
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
              tasks={tasksWithDynamicOverdue}
              onUpdateTaskStatus={handleUpdateTaskStatus}
              setActivePage={setActivePage}
              setSelectedMeetingId={setSelectedMeetingId}
            />
          )}

          {activePage === 'ai-followup' && (
            <AiFollowup
              tasks={tasksWithDynamicOverdue}
              decisions={decisions}
              meetings={meetings}
              setActivePage={setActivePage}
              setSelectedMeetingId={setSelectedMeetingId}
            />
          )}

          {activePage === 'settings' && (
            <Settings onResetData={handleResetData} />
          )}
        </main>
      </div>
    </div>
  );
}
