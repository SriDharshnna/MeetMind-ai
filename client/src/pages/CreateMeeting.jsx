import React, { useState } from 'react';
import {
  Sparkles,
  Calendar,
  Clock,
  Copy,
  ArrowRight,
  Brain,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { SAMPLE_TRANSCRIPT } from '../data/mockData';
import { simulateAgent1Analysis } from '../utils/helpers';

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

  // Form errors
  const [errors, setErrors] = useState({});

  // Analyzing state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);

  const handleLoadSample = () => {
    setTitle('Sprint Planning & Core Architecture Review');
    setDate('2026-11-01');
    setTime('10:00 AM');
    setParticipants('Rahul Sharma, Priya Patel, Alex Chen, Sarah Jenkins');
    setDescription('Sprint deliverables, authentication architecture, and database decisions.');
    setTranscript(SAMPLE_TRANSCRIPT);
    setErrors({});
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

  const handleAnalyze = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setIsAnalyzing(true);
    setAnalysisStep(1);

    setTimeout(() => {
      setAnalysisStep(2);
    }, 600);

    setTimeout(() => {
      setAnalysisStep(3);
    }, 1200);

    setTimeout(() => {
      setIsAnalyzing(false);

      // Perform realistic demonstration extraction
      const result = simulateAgent1Analysis({
        title,
        date,
        time,
        participants,
        description,
        transcript
      });

      if (onAddMeeting) {
        onAddMeeting(result);
      }
      setSelectedMeetingId(result.meeting.id);
      setActivePage('meeting-minutes');
    }, 1800);
  };

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
            Provide meeting discussion or notes for Agent 1 analysis.
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
              <strong>Agentic Rule:</strong> Commitments are only assigned to explicit owners and deadlines. All AI-extracted records will be presented for your review and approval before persistence.
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
              <span>{isAnalyzing ? 'Analyzing Meeting...' : 'Analyze Meeting with AI'}</span>
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
              Meeting Analysis Agent
            </h3>
            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Deconstructing discussion context into structured deliverables and decisions.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: analysisStep >= 1 ? 'var(--primary-dark)' : 'var(--text-muted)' }}>
                <CheckCircle2 size={16} color={analysisStep >= 1 ? 'var(--primary-dark)' : 'var(--text-muted)'} />
                <span>Parsing discussion transcripts & attendees</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: analysisStep >= 2 ? 'var(--primary-dark)' : 'var(--text-muted)' }}>
                <CheckCircle2 size={16} color={analysisStep >= 2 ? 'var(--primary-dark)' : 'var(--text-muted)'} />
                <span>Extracting commitments, owners & target deadlines</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: analysisStep >= 3 ? 'var(--primary-dark)' : 'var(--text-muted)' }}>
                <CheckCircle2 size={16} color={analysisStep >= 3 ? 'var(--primary-dark)' : 'var(--text-muted)'} />
                <span>Formulating Minutes of Meeting for approval</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
