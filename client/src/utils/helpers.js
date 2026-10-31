// Helper functions for MeetMind AI calculation, overdue detection, and extraction

// Reference date for deterministic comparison (or current browser date)
export const getReferenceDate = () => {
  // Use today's date from system clock
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

/**
 * Checks if a task is overdue.
 * CRITICAL RULE: Completed tasks are NEVER overdue!
 */
export const isTaskOverdue = (task) => {
  if (!task) return false;
  if (task.status === 'Completed') return false;
  if (!task.deadline) return false;

  const deadlineDate = new Date(task.deadline);
  if (isNaN(deadlineDate.getTime())) return false;
  deadlineDate.setHours(0, 0, 0, 0);

  const referenceDate = getReferenceDate();
  return deadlineDate < referenceDate;
};

/**
 * Calculates days overdue or days remaining
 */
export const getDeadlineMeta = (deadline, status) => {
  if (!deadline) {
    return { isOverdue: false, days: 0, label: 'No deadline' };
  }

  if (status === 'Completed') {
    return { isOverdue: false, days: 0, label: 'Completed' };
  }

  const deadlineDate = new Date(deadline);
  if (isNaN(deadlineDate.getTime())) {
    return { isOverdue: false, days: 0, label: deadline };
  }
  deadlineDate.setHours(0, 0, 0, 0);

  const referenceDate = getReferenceDate();
  const diffTime = deadlineDate - referenceDate;
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const daysOverdue = Math.abs(diffDays);
    return {
      isOverdue: true,
      days: daysOverdue,
      label: `${daysOverdue}d overdue`
    };
  } else if (diffDays === 0) {
    return {
      isOverdue: false,
      days: 0,
      label: 'Due today'
    };
  } else {
    return {
      isOverdue: false,
      days: diffDays,
      label: `${diffDays} days left`
    };
  }
};

/**
 * Format date string into readable text (e.g. Nov 01, 2026)
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric'
  });
};

/**
 * Generate Avatar Initials and deterministic color
 */
export const getAvatarMeta = (name) => {
  if (!name) return { initials: '?', color: '#8DAF91' };
  const parts = name.trim().split(' ');
  const initials = parts.length > 1
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : parts[0].slice(0, 2).toUpperCase();

  const colors = ['#426B50', '#8DAF91', '#2D6A8E', '#8B7355', '#C98818', '#5E7D63'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const color = colors[Math.abs(hash) % colors.length];

  return { initials, color };
};

/**
 * Heuristic Frontend Demonstration for Agent 1 Analysis
 * Parses meeting transcript/notes into structured MOM, tasks, and decisions
 */
export const simulateAgent1Analysis = ({
  title,
  date,
  time,
  participants,
  description,
  transcript
}) => {
  const attendeesList = (participants || '')
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean)
    .map((name) => {
      const meta = getAvatarMeta(name);
      return {
        name,
        role: name.includes('Rahul')
          ? 'Backend Lead'
          : name.includes('Priya')
          ? 'Frontend Lead'
          : name.includes('Alex')
          ? 'Database Engineer'
          : name.includes('Sarah')
          ? 'Product Manager'
          : 'Team Member',
        avatar: meta.initials,
        color: meta.color
      };
    });

  const meetingId = `meet-${Date.now()}`;
  const lines = transcript.split('\n').map((l) => l.trim()).filter(Boolean);

  // Extract candidate action items
  const extractedTasks = [];
  const extractedDecisions = [];
  const discussionPoints = [];

  // Parse lines for commitments and decisions
  lines.forEach((line, index) => {
    const lower = line.toLowerCase();

    // Check for decision
    if (lower.includes('decide') || lower.includes('decision') || lower.includes('agreed to')) {
      const decTitle = line.replace(/^[-*•]\s*/, '').replace(/^(sarah|rahul|priya|alex|the team)[^:]*:\s*/i, '');
      extractedDecisions.push({
        id: `dec-${Date.now()}-${index}`,
        meetingId,
        meetingTitle: title || 'Meeting Analysis',
        title: decTitle.slice(0, 70),
        description: decTitle,
        date: date || new Date().toISOString().split('T')[0],
        owner: attendeesList[0]?.name || 'Engineering Team',
        category: lower.includes('database') || lower.includes('api') ? 'Architecture' : 'Process',
        status: 'Implemented',
        rationale: 'Agreed unanimously during sync based on sprint deliverables and technical alignment.'
      });
    }

    // Check for commitments (names + must/will/complete/deadline)
    attendeesList.forEach((att) => {
      const firstName = att.name.split(' ')[0].toLowerCase();
      if (lower.includes(firstName) && (lower.includes('complete') || lower.includes('finish') || lower.includes('deliver') || lower.includes('implement') || lower.includes('finalize'))) {
        let deadline = date || '2026-11-05';
        if (lower.includes('nov 3') || lower.includes('november 3')) deadline = '2026-11-03';
        else if (lower.includes('nov 5') || lower.includes('november 5')) deadline = '2026-11-05';
        else if (lower.includes('nov 6') || lower.includes('november 6')) deadline = '2026-11-06';

        const cleanTitle = line
          .replace(/^[-*•]\s*/, '')
          .replace(new RegExp(`^${firstName}[^:]*:\\s*`, 'i'), '')
          .slice(0, 80);

        extractedTasks.push({
          id: `tsk-${Date.now()}-${extractedTasks.length + 1}`,
          meetingId,
          meetingTitle: title || 'Meeting Analysis',
          title: cleanTitle.length > 5 ? cleanTitle : `Deliver commitments for ${att.name}`,
          description: line,
          owner: att.name,
          ownerAvatar: att.avatar,
          deadline,
          priority: lower.includes('urgent') || lower.includes('pending') ? 'High' : 'Medium',
          status: 'In Progress'
        });
      }
    });

    // Discussion points
    if (line.includes(':') && line.length > 30 && discussionPoints.length < 5) {
      const [speaker, ...rest] = line.split(':');
      discussionPoints.push({
        topic: `Discussion on ${speaker.trim()}'s Deliverables`,
        notes: rest.join(':').trim(),
        speaker: speaker.trim()
      });
    }
  });

  // Fallbacks if transcript is sparse
  if (extractedTasks.length === 0) {
    extractedTasks.push({
      id: `tsk-${Date.now()}-1`,
      meetingId,
      meetingTitle: title,
      title: 'Action Item 1: Review Discussion Outcomes',
      description: 'Follow up on discussion points captured in meeting transcript.',
      owner: attendeesList[0]?.name || 'Sarah Jenkins',
      ownerAvatar: attendeesList[0]?.avatar || 'SJ',
      deadline: '2026-11-05',
      priority: 'High',
      status: 'Pending'
    });
  }

  if (extractedDecisions.length === 0) {
    extractedDecisions.push({
      id: `dec-${Date.now()}-1`,
      meetingId,
      meetingTitle: title,
      title: 'Action Plan Approval for Sprint Goals',
      description: 'The team approved the sprint objectives and timeline alignment.',
      date: date || '2026-11-01',
      owner: attendeesList[0]?.name || 'Sarah Jenkins',
      category: 'Planning',
      status: 'Implemented',
      rationale: 'Unanimous alignment on schedule and milestones.'
    });
  }

  if (discussionPoints.length === 0) {
    discussionPoints.push({
      topic: 'Core Discussion Points',
      notes: description || 'Discussion of primary deliverables, technical milestones, and dependencies.',
      speaker: attendeesList[0]?.name || 'Sarah Jenkins'
    });
  }

  const generatedMeeting = {
    id: meetingId,
    title: title || 'Sprint Architecture Review',
    date: date || '2026-11-01',
    time: time ? `${time} - 11:00 AM` : '10:00 AM - 11:00 AM',
    duration: '60 mins',
    status: 'Draft (Awaiting Approval)',
    participants: attendeesList,
    summary: `Meeting concluded with ${extractedTasks.length} extracted action items and ${extractedDecisions.length} recorded decisions. Primary focus: ${description || 'Sprint deliverables, task assignment, and timeline tracking'}.`,
    discussionPoints,
    actionItemsCount: extractedTasks.length,
    decisionsCount: extractedDecisions.length,
    rawNotes: transcript
  };

  return {
    meeting: generatedMeeting,
    tasks: extractedTasks,
    decisions: extractedDecisions
  };
};
