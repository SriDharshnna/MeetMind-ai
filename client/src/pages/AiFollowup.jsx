import React, { useState } from 'react';
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
  Brain
} from 'lucide-react';
import { formatDate, getDeadlineMeta } from '../utils/helpers';

export default function AiFollowup({
  tasks,
  decisions,
  meetings,
  setActivePage,
  setSelectedMeetingId
}) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Dynamically derive outstanding tasks from current state
  const outstandingTasks = tasks.filter((t) => t.status !== 'Completed');

  // Dynamically derive decisions awaiting implementation
  const pendingDecisions = decisions.filter((d) => d.status !== 'Implemented');

  // Recurring / unresolved topics from meeting records
  const recurringTopics = [
    {
      topic: 'API Integration & Frontend Schema Contract',
      frequency: 'Appeared in multiple meetings without schema sign-off',
      recommendation: 'Freeze the JSON contract for workspace and task endpoints to unblock client state.',
      status: 'Unresolved'
    },
    {
      topic: 'Staging Cluster Security & Network Whitelist',
      frequency: 'Discussed in security and database syncs',
      recommendation: 'Verify IP egress rules in staging VPC before running integration tests.',
      status: 'Pending Verification'
    }
  ];

  // Dynamic suggested agenda built from actual tasks and decisions
  const [agenda, setAgenda] = useState([
    {
      time: '10:00 - 10:15 AM',
      topic: 'Review Overdue Deliverables & Blockers',
      leader: outstandingTasks[0]?.owner || 'Engineering Lead',
      objective: 'Address delayed deliverables and realign on immediate milestone dependencies.'
    },
    {
      time: '10:15 - 10:30 AM',
      topic: 'Resolution of API Integration Schema',
      leader: 'Rahul Sharma & Priya Patel',
      objective: 'Finalize request/response contract for client workspace data feeds.'
    },
    {
      time: '10:30 - 10:45 AM',
      topic: 'Decision Execution: ' + (pendingDecisions[0]?.title || 'Architecture Alignment'),
      leader: pendingDecisions[0]?.owner || 'Alex Chen',
      objective: 'Review implementation progress and next milestone sign-off.'
    },
    {
      time: '10:45 - 11:00 AM',
      topic: 'Sprint Commitments & Ownership Lock',
      leader: 'Sarah Jenkins',
      objective: 'Record target deadlines in MeetMind AI persistent tracking.'
    }
  ]);

  const handleGenerateAgenda = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);

      // Re-synthesize agenda based on active tasks and decisions
      const topOverdue = outstandingTasks.find((t) => t.isOverdue);
      const topTask = outstandingTasks[0];
      const topDecision = pendingDecisions[0];

      setAgenda([
        {
          time: '10:00 - 10:15 AM',
          topic: topOverdue ? `Overdue Resolution: ${topOverdue.title}` : 'Review Team Commitments',
          leader: topOverdue?.owner || 'Team Lead',
          objective: 'Identify resolution path for deliverables that passed deadline threshold.'
        },
        {
          time: '10:15 - 10:30 AM',
          topic: 'Unresolved Recurring Topic: API Contract Freeze',
          leader: 'Rahul Sharma & Priya Patel',
          objective: 'Sign off on JSON schemas between backend routes and frontend components.'
        },
        {
          time: '10:30 - 10:45 AM',
          topic: topDecision ? `Decision Implementation: ${topDecision.title}` : 'Architecture Progress Review',
          leader: topDecision?.owner || 'Alex Chen',
          objective: 'Ensure approved architectural choices are actively executed.'
        },
        {
          time: '10:45 - 11:00 AM',
          topic: 'New Action Items & Deadlines Alignment',
          leader: 'Sarah Jenkins',
          objective: 'Record commitments into persistent tracking with strict ownership.'
        }
      ]);

      setToastMessage('Agent 4 (Follow-up Agent) regenerated the next meeting agenda based on live commitments.');
      setTimeout(() => setToastMessage(''), 3000);
    }, 1000);
  };

  const handleCopyAgenda = () => {
    const text = agenda
      .map((item) => `${item.time} | ${item.topic}\nDiscussion Lead: ${item.leader}\nObjective: ${item.objective}`)
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
              <span className="ai-badge">AGENTIC LOOP</span>
            </div>
            <p style={{ fontSize: '12.5px', color: 'var(--text-main)', maxWidth: '640px', margin: 0, lineHeight: 1.4 }}>
              Synthesizes pending deliverables, persistent decisions, and repeated discussions into actionable follow-up agendas.
            </p>
          </div>
        </div>

        <button
          className="btn btn-primary"
          onClick={handleGenerateAgenda}
          disabled={isGenerating}
        >
          <RefreshCw size={15} className={isGenerating ? 'animate-spin' : ''} />
          <span>{isGenerating ? 'Synthesizing...' : 'Generate Follow-up Agenda'}</span>
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
            {outstandingTasks.slice(0, 4).map((item) => {
              const meta = getDeadlineMeta(item.deadline, item.status);
              return (
                <div
                  key={item.id}
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
                    Owner: <strong>{item.owner}</strong> • Target: {formatDate(item.deadline)}
                  </div>
                </div>
              );
            })}
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
              {recurringTopics.length} Active
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {recurringTopics.map((topic, idx) => (
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
            ))}
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
                  key={dec.id}
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
                    Champion: <strong>{dec.owner || 'Team'}</strong> • Status: <strong>{dec.status}</strong>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Suggested Agenda for Next Meeting */}
      <div className="card" style={{ padding: '22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={16} color="var(--primary-dark)" />
              <h3 style={{ fontSize: '15.5px', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                Suggested Agenda for Upcoming Meeting
              </h3>
            </div>
            <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
              Constructed from outstanding deliverables and pending architectural decisions
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {agenda.map((item, idx) => (
            <div
              key={idx}
              style={{
                display: 'grid',
                gridTemplateColumns: '120px 1fr',
                gap: '14px',
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: idx === 0 ? 'var(--overdue-bg)' : 'var(--bg-main)',
                border: idx === 0 ? '1px solid var(--overdue-border)' : '1px solid var(--border-color)',
                alignItems: 'center'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: idx === 0 ? 'var(--overdue-coral)' : 'var(--primary-dark)' }}>
                <Clock size={13} />
                <span>{item.time}</span>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>
                    {item.topic}
                  </span>
                  <span className="badge badge-sage" style={{ fontSize: '10.5px' }}>
                    Lead: {item.leader}
                  </span>
                </div>
                <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', margin: 0 }}>
                  <strong>Objective:</strong> {item.objective}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
