import React, { useState } from 'react';
import {
  Sparkles,
  Calendar,
  Clock,
  Copy,
  ArrowRight,
  Brain,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Plus,
  Save,
  Edit3,
  RotateCcw,
  ShieldCheck,
  CheckSquare,
  HelpCircle
} from 'lucide-react';
import { SAMPLE_TRANSCRIPT } from '../data/mockData';
import { simulateAgent1Analysis, getAvatarMeta } from '../utils/helpers';
import * as api from '../services/api';

export default function CreateMeeting({
  onAddMeeting,
  setActivePage,
  setSelectedMeetingId
}) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('10:00 AM');
  const [participants, setParticipants] = useState('');
  const [description, setDescription] = useState('');
  const [transcript, setTranscript] = useState('');

  // Form validation errors
  const [errors, setErrors] = useState({});

  // Analyzing state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);

  // Review stage state
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewedSummary, setReviewedSummary] = useState('');
  const [reviewedDiscussionPoints, setReviewedDiscussionPoints] = useState([]);
  const [reviewedTasks, setReviewedTasks] = useState([]);
  const [reviewedDecisions, setReviewedDecisions] = useState([]);
  const [reviewedFollowUps, setReviewedFollowUps] = useState([]);

  // Saving state
  const [isSaving, setIsSaving] = useState(false);

  const handleLoadSample = () => {
    setTitle('Sprint Planning & Core Architecture Review');
    setDate('2026-11-01');
    setTime('10:00 AM');
    setParticipants('Rahul Sharma, Priya Patel, Alex Chen, Sarah Jenkins');
    setDescription('Sprint deliverables, authentication architecture, and database decisions.');
    setTranscript(SAMPLE_TRANSCRIPT);
    setErrors({});
    setAnalysisError(null);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!title.trim()) newErrors.title = 'Meeting title is required';
    if (!date) newErrors.date = 'Meeting date is required';
    if (!participants.trim()) newErrors.participants = 'Please specify at least one participant';
    if (!transcript.trim()) newErrors.transcript = 'Meeting transcript or notes cannot be empty';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Call Gemini AI Analysis
  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsAnalyzing(true);
    setAnalysisError(null);

    const payload = {
      title,
      date,
      time,
      participants: participants.split(',').map((p) => p.trim()),
      description,
      transcript
    };

    try {
      // 1. Call Backend Gemini API
      const aiResponse = await api.analyzeMeetingWithAi(payload);

      // Populate review state with verified Gemini data
      setReviewedSummary(aiResponse.summary || '');
      setReviewedDiscussionPoints(aiResponse.discussionPoints || []);
      setReviewedTasks(aiResponse.actionItems || []);
      setReviewedDecisions(aiResponse.decisions || []);
      setReviewedFollowUps(aiResponse.followUpTopics || []);
      setIsReviewing(true);
    } catch (err) {
      console.warn('[Gemini AI] API call failed or key not configured:', err.message);

      // Inform user of the Gemini error
      setAnalysisError(
        `Gemini API Error: ${err.message}. If GEMINI_API_KEY is not yet added in server/.env, you can review using the local fallback parser below.`
      );

      // Fallback parser so workflow is not halted
      const fallback = simulateAgent1Analysis(payload);
      setReviewedSummary(fallback.meeting.summary);
      setReviewedDiscussionPoints(fallback.meeting.discussionPoints);
      setReviewedTasks(fallback.tasks);
      setReviewedDecisions(fallback.decisions);
      setReviewedFollowUps([
        {
          topic: 'API Contract Integration',
          context: 'Pending cross-team schema agreement.',
          recommendation: 'Freeze JSON schemas before frontend release.'
        }
      ]);
      setIsReviewing(true);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Review Stage Handlers (Edit, Add, Remove)
  // ---------------------------------------------------------------------------

  const handleUpdateTaskField = (index, field, value) => {
    setReviewedTasks((prev) =>
      prev.map((t, i) => (i === index ? { ...t, [field]: value } : t))
    );
  };

  const handleRemoveTask = (index) => {
    setReviewedTasks((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddTask = () => {
    setReviewedTasks((prev) => [
      ...prev,
      {
        title: 'New Action Item',
        description: '',
        owner: 'Unassigned',
        deadline: date || '2026-11-05',
        priority: 'Medium'
      }
    ]);
  };

  const handleUpdateDecisionField = (index, field, value) => {
    setReviewedDecisions((prev) =>
      prev.map((d, i) => (i === index ? { ...d, [field]: value } : d))
    );
  };

  const handleRemoveDecision = (index) => {
    setReviewedDecisions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddDecision = () => {
    setReviewedDecisions((prev) => [
      ...prev,
      {
        title: 'New Confirmed Decision',
        description: '',
        responsiblePerson: 'Engineering Team',
        implementationStatus: 'Decided',
        category: 'Architecture'
      }
    ]);
  };

  // ---------------------------------------------------------------------------
  // Approve & Save to MongoDB
  // ---------------------------------------------------------------------------
  const handleApproveAndSave = async () => {
    setIsSaving(true);
    try {
      const attendeesList = participants
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean)
        .map((name) => {
          const meta = getAvatarMeta(name);
          return {
            name,
            role: 'Team Member',
            avatar: meta.initials,
            color: meta.color
          };
        });

      const meetingData = {
        title: title || 'Sprint Planning Meeting',
        date,
        time,
        duration: '60 mins',
        participants: attendeesList,
        transcript,
        summary: reviewedSummary,
        discussionPoints: reviewedDiscussionPoints,
        status: 'Approved',
        rawNotes: transcript
      };

      // Prepared sanitized tasks
      const sanitizedTasks = reviewedTasks.map((t) => ({
        title: t.title,
        description: t.description || '',
        owner: t.owner || 'Unassigned',
        ownerAvatar: t.owner ? t.owner.slice(0, 2).toUpperCase() : 'TM',
        deadline: t.deadline || date,
        priority: t.priority || 'Medium',
        status: 'Pending'
      }));

      // Prepared sanitized decisions
      const sanitizedDecisions = reviewedDecisions.map((d) => ({
        title: d.title,
        description: d.description || '',
        responsiblePerson: d.responsiblePerson || 'Team',
        implementationStatus: d.implementationStatus || 'Decided',
        category: d.category || 'Architecture',
        rationale: d.rationale || ''
      }));

      await onAddMeeting({
        meeting: meetingData,
        tasks: sanitizedTasks,
        decisions: sanitizedDecisions
      });
    } catch (err) {
      console.error('Save failed:', err);
      alert('Error saving approved meeting: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // ===========================================================================
  // RENDER: Review & Approval Stage
  // ===========================================================================
  if (isReviewing) {
    return (
      <div style={{ maxWidth: '940px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '22px' }}>
        {analysisError && (
          <div
            style={{
              padding: '12px 18px',
              backgroundColor: 'var(--warning-bg)',
              border: '1px solid var(--warning-border)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <AlertCircle size={18} color="var(--warning-amber)" />
            <span style={{ fontSize: '12.5px', color: 'var(--text-main)', lineHeight: 1.4 }}>
              {analysisError}
            </span>
          </div>
        )}

        {/* Review Stage Action Header */}
        <div
          className="card"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '14px',
            padding: '18px 24px',
            backgroundColor: 'var(--card-light)',
            border: '1px solid var(--primary-sage-subtle)'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
              <Brain size={20} color="var(--primary-dark)" />
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--primary-dark)', margin: 0 }}>
                Review & Verify AI Extraction
              </h2>
              <span className="badge badge-sage">Human-in-the-Loop</span>
            </div>
            <p style={{ fontSize: '12.5px', color: 'var(--text-main)', margin: 0 }}>
              Verify extracted action items and decisions. Edit incorrect values or remove items before persisting to the database.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsReviewing(false)}
              disabled={isSaving}
            >
              <RotateCcw size={14} />
              <span>Edit Transcript</span>
            </button>

            <button
              type="button"
              className="btn btn-primary"
              onClick={handleApproveAndSave}
              disabled={isSaving}
              style={{ minWidth: '180px' }}
            >
              <Save size={15} />
              <span>{isSaving ? 'Saving to Database...' : 'Approve & Save Records'}</span>
            </button>
          </div>
        </div>

        {/* Section 1: Executive Summary */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Sparkles size={16} color="var(--primary-dark)" />
              Executive Summary
            </h3>
            <span className="badge badge-sage">AI Generated</span>
          </div>
          <textarea
            className="form-textarea"
            style={{ minHeight: '90px', fontSize: '13.5px', lineHeight: 1.5 }}
            value={reviewedSummary}
            onChange={(e) => setReviewedSummary(e.target.value)}
          />
        </div>

        {/* Section 2: Extracted Action Items (Editable) */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <CheckSquare size={16} color="var(--primary-dark)" />
                Extracted Action Items ({reviewedTasks.length})
              </h3>
              <span className="card-subtitle">Verify owners, deadlines, and priorities</span>
            </div>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleAddTask}
            >
              <Plus size={13} />
              <span>Add Action Item</span>
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {reviewedTasks.length === 0 ? (
              <p style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>No action items extracted.</p>
            ) : (
              reviewedTasks.map((t, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '14px 16px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-main)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Task Title"
                      value={t.title}
                      onChange={(e) => handleUpdateTaskField(idx, 'title', e.target.value)}
                      style={{ fontWeight: 600, fontSize: '13.5px' }}
                    />
                    <button
                      type="button"
                      className="btn btn-danger-soft btn-sm"
                      onClick={() => handleRemoveTask(idx)}
                      title="Remove this action item"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  <div className="grid-3">
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                        Assignee / Owner
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. Rahul Sharma"
                        value={t.owner || ''}
                        onChange={(e) => handleUpdateTaskField(idx, 'owner', e.target.value)}
                        style={{ padding: '6px 10px', fontSize: '12px' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                        Deadline (YYYY-MM-DD)
                      </label>
                      <input
                        type="date"
                        className="form-input"
                        value={t.deadline || ''}
                        onChange={(e) => handleUpdateTaskField(idx, 'deadline', e.target.value)}
                        style={{ padding: '6px 10px', fontSize: '12px' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                        Priority
                      </label>
                      <select
                        className="form-select"
                        value={t.priority || 'Medium'}
                        onChange={(e) => handleUpdateTaskField(idx, 'priority', e.target.value)}
                        style={{ padding: '6px 10px', fontSize: '12px' }}
                      >
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Section 3: Extracted Decisions (Editable) */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <ShieldCheck size={16} color="var(--primary-dark)" />
                Identified Decisions ({reviewedDecisions.length})
              </h3>
              <span className="card-subtitle">Confirmed agreements and architecture choices</span>
            </div>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleAddDecision}
            >
              <Plus size={13} />
              <span>Add Decision</span>
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {reviewedDecisions.length === 0 ? (
              <p style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>No confirmed decisions extracted.</p>
            ) : (
              reviewedDecisions.map((d, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '14px 16px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-main)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Decision Title"
                      value={d.title}
                      onChange={(e) => handleUpdateDecisionField(idx, 'title', e.target.value)}
                      style={{ fontWeight: 600, fontSize: '13.5px' }}
                    />
                    <button
                      type="button"
                      className="btn btn-danger-soft btn-sm"
                      onClick={() => handleRemoveDecision(idx)}
                      title="Remove this decision"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  <div className="grid-2">
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                        Decision Champion / Lead
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. Alex Chen"
                        value={d.responsiblePerson || ''}
                        onChange={(e) => handleUpdateDecisionField(idx, 'responsiblePerson', e.target.value)}
                        style={{ padding: '6px 10px', fontSize: '12px' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                        Implementation Status
                      </label>
                      <select
                        className="form-select"
                        value={d.implementationStatus || 'Decided'}
                        onChange={(e) => handleUpdateDecisionField(idx, 'implementationStatus', e.target.value)}
                        style={{ padding: '6px 10px', fontSize: '12px' }}
                      >
                        <option value="Decided">Decided</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Implemented">Implemented</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Bottom Save Action */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setIsReviewing(false)}
            disabled={isSaving}
          >
            Back to Edit
          </button>
          <button
            type="button"
            className="btn btn-primary btn-lg"
            onClick={handleApproveAndSave}
            disabled={isSaving}
          >
            <Save size={16} />
            <span>{isSaving ? 'Saving to Database...' : 'Approve & Save Records to MongoDB'}</span>
          </button>
        </div>
      </div>
    );
  }

  // ===========================================================================
  // RENDER: Initial Meeting Notes Form
  // ===========================================================================
  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Header bar */}
      <div
        className="card"
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
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
            Enter Meeting Information & Notes
          </h2>
          <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
            Provide meeting discussion or notes for Google Gemini Agent 1 analysis.
          </span>
        </div>

        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={handleLoadSample}
          title="Populate form with the demonstration sample transcript"
        >
          <Copy size={14} />
          <span>Load Sample Transcript</span>
        </button>
      </div>

      {analysisError && (
        <div
          style={{
            padding: '12px 18px',
            backgroundColor: 'var(--overdue-bg)',
            border: '1px solid var(--overdue-border)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          <AlertCircle size={18} color="var(--overdue-coral)" />
          <span style={{ fontSize: '12.5px', color: 'var(--text-main)', lineHeight: 1.4 }}>
            {analysisError}
          </span>
        </div>
      )}

      {/* Main Form Card */}
      <div className="card" style={{ padding: '24px 28px' }}>
        <form onSubmit={handleAnalyze} noValidate>
          {/* Title */}
          <div className="form-group">
            <label className="form-label">
              Meeting Title *
              {errors.title && <span style={{ color: 'var(--overdue-coral)', fontSize: '12px' }}>{errors.title}</span>}
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Sprint Planning & Architecture Review"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors((prev) => ({ ...prev, title: null }));
              }}
              style={errors.title ? { borderColor: 'var(--overdue-coral)' } : {}}
            />
          </div>

          {/* Date, Time, Participants Grid */}
          <div className="grid-3">
            <div className="form-group">
              <label className="form-label">
                Date *
                {errors.date && <span style={{ color: 'var(--overdue-coral)', fontSize: '12px' }}>{errors.date}</span>}
              </label>
              <input
                type="date"
                className="form-input"
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  if (errors.date) setErrors((prev) => ({ ...prev, date: null }));
                }}
                style={errors.date ? { borderColor: 'var(--overdue-coral)' } : {}}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Time</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. 10:00 AM"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Participants *
                {errors.participants && <span style={{ color: 'var(--overdue-coral)', fontSize: '12px' }}>{errors.participants}</span>}
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="Comma separated names"
                value={participants}
                onChange={(e) => {
                  setParticipants(e.target.value);
                  if (errors.participants) setErrors((prev) => ({ ...prev, participants: null }));
                }}
                style={errors.participants ? { borderColor: 'var(--overdue-coral)' } : {}}
              />
            </div>
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">
              Meeting Purpose / Context
              <span className="form-hint">Optional summary objective</span>
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Review deliverables, database decisions, and sprint commitments"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Transcript / Notes */}
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <label className="form-label" style={{ margin: 0 }}>
                Meeting Transcript or Discussion Notes *
              </label>
              {errors.transcript && <span style={{ color: 'var(--overdue-coral)', fontSize: '12px' }}>{errors.transcript}</span>}
            </div>
            <textarea
              className="form-textarea"
              style={{
                minHeight: '160px',
                fontFamily: 'var(--font-mono)',
                fontSize: '13px',
                borderColor: errors.transcript ? 'var(--overdue-coral)' : undefined
              }}
              placeholder="Paste raw notes or transcript. e.g.:
Rahul must complete the authentication API by November 5.
Priya must complete the dashboard UI by November 3.
The team officially decided to use MongoDB."
              value={transcript}
              onChange={(e) => {
                setTranscript(e.target.value);
                if (errors.transcript) setErrors((prev) => ({ ...prev, transcript: null }));
              }}
            />
          </div>

          {/* Agentic Extraction Note */}
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: 'var(--card-light)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--primary-sage-subtle)',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <Brain size={18} color="var(--primary-dark)" />
            <div style={{ fontSize: '12.5px', color: 'var(--text-main)', lineHeight: 1.4 }}>
              <strong>Gemini Agentic Extraction:</strong> Google Gemini parses discussion context to extract structured MOM, verified owners, resolved deadlines, and confirmed decisions. You will have full opportunity to edit before saving.
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setActivePage('meetings')}
              disabled={isAnalyzing}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={isAnalyzing}
              style={{ minWidth: '220px' }}
            >
              <Sparkles size={16} />
              <span>{isAnalyzing ? 'Analyzing with Gemini AI...' : 'Analyze Meeting with AI'}</span>
              {!isAnalyzing && <ArrowRight size={15} />}
            </button>
          </div>
        </form>
      </div>

      {/* Analysis Stepper Modal */}
      {isAnalyzing && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '420px', textAlign: 'center', padding: '32px 24px' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: 'var(--card-light)',
                color: 'var(--primary-dark)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto'
              }}
            >
              <Brain size={28} />
            </div>

            <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
              Gemini Meeting Analysis Agent
            </h3>
            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Deconstructing discussion context into structured deliverables, deadlines, and decisions.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: 'var(--primary-dark)' }}>
                <CheckCircle2 size={16} color="var(--primary-dark)" />
                <span>Contacting Google Gemini API</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: 'var(--primary-dark)' }}>
                <CheckCircle2 size={16} color="var(--primary-dark)" />
                <span>Extracting commitments, owners & resolving dates</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: 'var(--primary-dark)' }}>
                <CheckCircle2 size={16} color="var(--primary-dark)" />
                <span>Validating structured schema with Zod</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
