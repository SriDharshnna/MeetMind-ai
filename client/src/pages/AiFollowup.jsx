import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  RefreshCw,
  Copy,
  CheckCircle2,
  AlertTriangle,
  Repeat,
  ShieldCheck,
  Clock,
  ArrowRight,
  Brain,
  Edit3,
  Save,
  Check,
  Plus,
  Trash2
} from 'lucide-react';
import { formatDate, getDeadlineMeta } from '../utils/helpers';
import * as api from '../services/api';

export default function AiFollowup({
  tasks = [],
  decisions = [],
  meetings = [],
  setActivePage,
  setSelectedMeetingId
}) {
  const [reportId, setReportId] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Dynamically derive outstanding tasks from current state
  const outstandingTasks = tasks.filter((t) => t.status !== 'Completed');

  // Dynamically derive decisions awaiting implementation
  const pendingDecisions = decisions.filter((d) => d.status !== 'Implemented' && d.implementationStatus !== 'Implemented');

  // Recurring / unresolved topics from Agent 4
  const [recurringTopics, setRecurringTopics] = useState([]);

  // Suggested agenda from Agent 4
  const [agenda, setAgenda] = useState([]);

  // Load latest follow-up report on initial mount
  useEffect(() => {
    let isMounted = true;
    const fetchReport = async () => {
      try {
        setIsLoading(true);
        setErrorMessage('');
        const data = await api.getFollowupReport();
        if (isMounted && data) {
          if (data._id || data.id || data.reportId) {
            setReportId(data._id || data.id || data.reportId);
          }
          if (Array.isArray(data.suggestedAgenda) && data.suggestedAgenda.length > 0) {
            setAgenda(data.suggestedAgenda);
          }
          if (Array.isArray(data.repeatedTopics) && data.repeatedTopics.length > 0) {
            setRecurringTopics(data.repeatedTopics);
          }
        }
      } catch (err) {
        console.warn('[AiFollowup] Could not load persisted report, initializing default agenda:', err.message);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchReport();
    return () => { isMounted = false; };
  }, []);

  // Trigger Agent 4 Follow-up Agenda Generation
  const handleGenerateAgenda = async () => {
    try {
      setIsGenerating(true);
      setErrorMessage('');
      const response = await api.generateFollowupAgenda();
      if (response) {
        setReportId(response.reportId || response._id);
        if (Array.isArray(response.suggestedAgenda)) {
          setAgenda(response.suggestedAgenda);
        }
        if (Array.isArray(response.repeatedTopics)) {
          setRecurringTopics(response.repeatedTopics);
        }
        setToastMessage('Agent 4 (Follow-up Agent) synthesized live organizational memory.');
        setTimeout(() => setToastMessage(''), 3500);
      }
    } catch (err) {
      console.error('[AiFollowup] Generation failed:', err);
      setErrorMessage(`Failed to generate agenda: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Save reviewed & edited agenda to MongoDB
  const handleSaveAgendaEdits = async () => {
    if (!reportId) {
      setIsEditing(false);
      setToastMessage('Agenda changes saved locally.');
      setTimeout(() => setToastMessage(''), 2500);
      return;
    }

    try {
      setIsSaving(true);
      await api.updateFollowupReport(reportId, {
        suggestedAgenda: agenda,
        status: 'Reviewed'
      });
      setIsEditing(false);
      setToastMessage('Manager review saved to database successfully.');
      setTimeout(() => setToastMessage(''), 3000);
    } catch (err) {
      console.error('[AiFollowup] Failed to save edits:', err);
      setErrorMessage(`Failed to save edits: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateAgendaItem = (index, field, value) => {
    setAgenda((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, [field]: value } : item))
    );
  };

  const handleAddAgendaItem = () => {
    setAgenda((prev) => [
      ...prev,
      {
        time: '15 mins',
        topic: 'Follow-up Discussion Topic',
        leader: 'Team Lead',
        objective: 'Define concrete next steps and commitments.',
        rationale: 'Manager-added agenda slot for team alignment.'
      }
    ]);
  };

  const handleRemoveAgendaItem = (index) => {
    setAgenda((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleCopyAgenda = () => {
    const text = agenda
      .map(
        (item) =>
          `${item.time} | ${item.topic}\nLead: ${item.leader}\nObjective: ${item.objective}\nRationale: ${item.rationale || 'Organizational priority'}`
      )
      .join('\n\n');
    navigator.clipboard.writeText(text);
    setToastMessage('Follow-up agenda copied to clipboard.');
    setTimeout(() => setToastMessage(''), 2500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {toastMessage && (
        <div className="toast-notice">
          <CheckCircle2 size={16} color="var(--primary-dark)" />
          <span>{toastMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--overdue-bg)',
            border: '1px solid var(--overdue-border)',
            color: 'var(--overdue-coral)',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <AlertTriangle size={16} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Banner */}
      <div
        className="card card-light-sage"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px',
          padding: '20px 24px',
          borderRadius: 'var(--radius-xl)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--primary-dark)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Brain size={24} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
              <h2 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--primary-dark)', margin: 0 }}>
                Agent 4: Meeting Continuity & Follow-up Interface
              </h2>
              <span className="ai-badge">MULTI-MEETING INTELLIGENCE</span>
            </div>
            <p style={{ fontSize: '12.5px', color: 'var(--text-main)', maxWidth: '640px', margin: 0, lineHeight: 1.4 }}>
              Synthesizes previous meeting records, overdue deliverables, pending decisions, and repeatedly unresolved topics into a structured next-meeting agenda.
            </p>
          </div>
        </div>

        <button
          className="btn btn-primary"
          onClick={handleGenerateAgenda}
          disabled={isGenerating}
        >
          <RefreshCw size={15} className={isGenerating ? 'animate-spin' : ''} />
          <span>{isGenerating ? 'Synthesizing with Gemini...' : 'Generate Follow-up Agenda'}</span>
        </button>
      </div>

      {/* 3 Input Streams */}
      <div className="grid-3">
        {/* Stream 1: Outstanding Tasks */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <AlertTriangle size={16} color="var(--overdue-coral)" />
              Outstanding Deliverables
            </h3>
            <span className="badge badge-sage">
              {outstandingTasks.length} Pending
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {outstandingTasks.length === 0 ? (
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>All tasks completed!</p>
            ) : (
              outstandingTasks.slice(0, 4).map((item) => {
                const meta = getDeadlineMeta(item.deadline, item.status);
                return (
                  <div
                    key={item.id || item._id}
                    style={{
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: meta.isOverdue ? 'var(--overdue-bg)' : 'var(--bg-main)',
                      border: meta.isOverdue ? '1px solid var(--overdue-border)' : '1px solid var(--border-color)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '3px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-main)' }}>
                        {item.title}
                      </span>
                      <span
                        className={`badge ${meta.isOverdue ? 'badge-overdue' : 'badge-sage'}`}
                        style={{ fontSize: '9.5px', padding: '1px 5px' }}
                      >
                        {meta.label}
                      </span>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                      Owner: <strong>{item.owner || 'Unassigned'}</strong> • Target: {formatDate(item.deadline)}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Stream 2: Repeated Unresolved Topics */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Repeat size={16} color="var(--warning-amber)" />
              Repeated Discussion Topics
            </h3>
            <span className="badge badge-amber">
              {recurringTopics.length} Detected
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {recurringTopics.length === 0 ? (
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                No unresolved topic repetitions detected across meetings.
              </p>
            ) : (
              recurringTopics.map((topic, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--warning-bg)',
                    border: '1px solid var(--warning-border)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}
                >
                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-main)' }}>
                    {topic.topic}
                  </span>
                  <span style={{ fontSize: '10.5px', color: 'var(--warning-amber)', fontWeight: 600 }}>
                    {topic.frequency}
                  </span>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
                    <strong>Recommendation:</strong> {topic.recommendation}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Stream 3: Decisions Awaiting Implementation */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <ShieldCheck size={16} color="var(--primary-dark)" />
              Pending Decisions
            </h3>
            <span className="badge badge-sage">
              {pendingDecisions.length} In Progress
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {pendingDecisions.length === 0 ? (
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>All recorded decisions implemented!</p>
            ) : (
              pendingDecisions.slice(0, 4).map((dec) => (
                <div
                  key={dec.id || dec._id}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-main)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '3px'
                  }}
                >
                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-main)' }}>
                    {dec.title}
                  </span>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                    Champion: <strong>{dec.responsiblePerson || dec.owner || 'Team'}</strong> • Status:{' '}
                    <strong>{dec.implementationStatus || dec.status}</strong>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Suggested Agenda for Next Meeting */}
      <div className="card" style={{ padding: '22px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
            flexWrap: 'wrap',
            gap: '10px'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={16} color="var(--primary-dark)" />
              <h3 style={{ fontSize: '15.5px', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                Suggested Agenda for Upcoming Meeting
              </h3>
              <span className="badge badge-sage">AI + Human Review</span>
            </div>
            <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
              Constructed by Agent 4 with explicit rationales for each recommendation
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isEditing ? (
              <>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={handleAddAgendaItem}
                >
                  <Plus size={13} />
                  <span>Add Item</span>
                </button>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={handleSaveAgendaEdits}
                  disabled={isSaving}
                >
                  <Save size={13} />
                  <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </>
            ) : (
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setIsEditing(true)}
              >
                <Edit3 size={13} />
                <span>Review & Edit Agenda</span>
              </button>
            )}

            <button
              className="btn btn-secondary btn-sm"
              onClick={handleCopyAgenda}
            >
              <Copy size={13} />
              <span>Copy Agenda</span>
            </button>

            <button
              className="btn btn-primary btn-sm"
              onClick={() => setActivePage('create-meeting')}
            >
              <span>Schedule Next Sync</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>

        {/* Structured Agenda Timeline */}
        {isLoading ? (
          <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '13px' }}>
            <RefreshCw size={20} className="animate-spin" style={{ margin: '0 auto 8px' }} />
            <p>Loading follow-up intelligence from MongoDB...</p>
          </div>
        ) : agenda.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '13px' }}>
            No agenda items currently available. Click "Generate Follow-up Agenda" above.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {agenda.map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: idx === 0 ? 'var(--overdue-bg)' : 'var(--bg-main)',
                  border: idx === 0 ? '1px solid var(--overdue-border)' : '1px solid var(--border-color)'
                }}
              >
                {isEditing ? (
                  // Editable Mode
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Time slot (e.g. 15 mins)"
                        value={item.time}
                        onChange={(e) => handleUpdateAgendaItem(idx, 'time', e.target.value)}
                        style={{ width: '130px', padding: '6px 8px', fontSize: '12px' }}
                      />
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Agenda Topic"
                        value={item.topic}
                        onChange={(e) => handleUpdateAgendaItem(idx, 'topic', e.target.value)}
                        style={{ flex: 1, padding: '6px 10px', fontWeight: 600, fontSize: '13px' }}
                      />
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Discussion Lead"
                        value={item.leader}
                        onChange={(e) => handleUpdateAgendaItem(idx, 'leader', e.target.value)}
                        style={{ width: '160px', padding: '6px 8px', fontSize: '12px' }}
                      />
                      <button
                        type="button"
                        className="btn btn-danger-soft btn-sm"
                        onClick={() => handleRemoveAgendaItem(idx)}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    <input
                      type="text"
                      className="form-input"
                      placeholder="Objective"
                      value={item.objective}
                      onChange={(e) => handleUpdateAgendaItem(idx, 'objective', e.target.value)}
                      style={{ padding: '6px 10px', fontSize: '12px' }}
                    />

                    <input
                      type="text"
                      className="form-input"
                      placeholder="Rationale (Why this topic is recommended)"
                      value={item.rationale || ''}
                      onChange={(e) => handleUpdateAgendaItem(idx, 'rationale', e.target.value)}
                      style={{ padding: '6px 10px', fontSize: '12px', fontStyle: 'italic' }}
                    />
                  </div>
                ) : (
                  // Display Mode
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '12px',
                            fontWeight: 700,
                            color: idx === 0 ? 'var(--overdue-coral)' : 'var(--primary-dark)'
                          }}
                        >
                          <Clock size={13} />
                          <span>{item.time}</span>
                        </div>
                        <span style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-main)' }}>
                          {item.topic}
                        </span>
                      </div>

                      <span className="badge badge-sage" style={{ fontSize: '11px' }}>
                        Discussion Lead: <strong>{item.leader}</strong>
                      </span>
                    </div>

                    <div style={{ fontSize: '12px', color: 'var(--text-main)' }}>
                      <strong>Objective:</strong> {item.objective}
                    </div>

                    {item.rationale && (
                      <div
                        style={{
                          fontSize: '11.5px',
                          color: 'var(--text-secondary)',
                          backgroundColor: 'rgba(255, 255, 255, 0.65)',
                          padding: '6px 10px',
                          borderRadius: 'var(--radius-sm)',
                          borderLeft: '3px solid var(--primary-sage)'
                        }}
                      >
                        <strong style={{ color: 'var(--primary-dark)' }}>Why this is recommended:</strong> {item.rationale}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
