import {
  retrievePreviousMeetings,
  retrievePendingTasks,
  retrieveOverdueTasks,
  retrievePendingDecisions,
  saveFollowUpReport
} from './tools/agentTools.js';
import { generateFollowUpWithGemini } from '../services/geminiService.js';
import { FollowUpReport } from '../models/FollowUpReport.js';

/**
 * Identify unresolved topics that appear repeatedly across previous meetings and decisions
 * Uses keyword frequency and cross-meeting topic matching
 */
export function identifyRepeatedTopics(meetings = [], pendingDecisions = [], pendingTasks = []) {
  const topicCounts = new Map();
  const stopwords = new Set([
    'the', 'and', 'for', 'with', 'that', 'this', 'from', 'have', 'were', 'will',
    'team', 'meeting', 'project', 'about', 'review', 'sync', 'status', 'update',
    'needs', 'need', 'must', 'should', 'been', 'their', 'when', 'what', 'which'
  ]);

  // 1. Scan discussion points across meetings
  meetings.forEach((m) => {
    if (Array.isArray(m.discussionPoints)) {
      m.discussionPoints.forEach((dp) => {
        const text = `${dp.topic || ''} ${dp.notes || ''}`.toLowerCase();
        const words = text
          .replace(/[^a-z0-9\s]/g, ' ')
          .split(/\s+/)
          .filter((w) => w.length > 3 && !stopwords.has(w));

        words.forEach((w) => {
          if (!topicCounts.has(w)) {
            topicCounts.set(w, { count: 0, meetings: new Set(), snippets: [] });
          }
          const item = topicCounts.get(w);
          item.count += 1;
          item.meetings.add(m.title);
          if (item.snippets.length < 2 && dp.topic) {
            item.snippets.push(dp.topic);
          }
        });
      });
    }
  });

  // 2. Identify tokens appearing across 2+ distinct meetings or with high repetition
  const repeated = [];
  topicCounts.forEach((val, key) => {
    if (val.meetings.size >= 2 || val.count >= 3) {
      const topicName = val.snippets[0] || `${key.charAt(0).toUpperCase() + key.slice(1)} Synchronization`;
      repeated.push({
        topic: topicName,
        frequency: `Discussed across ${val.meetings.size} meetings (${val.count} mentions)`,
        recommendation: `Schedule focused unblocking discussion; assign dedicated technical owner.`,
        status: 'Unresolved'
      });
    }
  });

  // 3. If zero or few repeated topics found, cross-reference pending decisions and overdue tasks
  if (repeated.length === 0) {
    if (pendingDecisions.length > 0) {
      repeated.push({
        topic: `Implementation of: ${pendingDecisions[0].title}`,
        frequency: `Awaiting execution since ${pendingDecisions[0].meetingTitle || 'recent sync'}`,
        recommendation: `Confirm owner ${pendingDecisions[0].responsiblePerson || 'lead'} and set completion milestones.`,
        status: 'Pending Review'
      });
    }
    if (pendingTasks.filter((t) => t.isOverdue).length > 0) {
      const overdue = pendingTasks.filter((t) => t.isOverdue)[0];
      repeated.push({
        topic: `Overdue Deliverable: ${overdue.title}`,
        frequency: `${overdue.daysDiff ? Math.abs(overdue.daysDiff) : 1} days overdue`,
        recommendation: `Re-evaluate scope or reallocate resources with ${overdue.owner}.`,
        status: 'Unresolved'
      });
    }
  }

  // Deduplicate by topic title
  const uniqueTopics = [];
  const seen = new Set();
  for (const item of repeated) {
    const norm = item.topic.toLowerCase().trim();
    if (!seen.has(norm)) {
      seen.add(norm);
      uniqueTopics.push(item);
    }
  }

  return uniqueTopics.slice(0, 4);
}

/**
 * Agent 4: Follow-up & Next-Meeting Intelligence Agent
 * Synthesizes past meetings, overdue deliverables, pending decisions, and recurring themes
 * to construct a high-impact Suggested Agenda with explicit rationales.
 */
export async function runFollowUpAgent() {
  console.log('[Agent 4: Follow-up Agent] Synthesizing organizational memory for next meeting agenda...');

  // 1. Tool Execution: Retrieve organizational memory from MongoDB
  const [previousMeetings, pendingTasks, overdueTasks, pendingDecisions] = await Promise.all([
    retrievePreviousMeetings(5),
    retrievePendingTasks(),
    retrieveOverdueTasks(),
    retrievePendingDecisions()
  ]);

  console.log(`[Agent 4: Follow-up Agent] Retrieved: ${previousMeetings.length} meetings, ${pendingTasks.length} pending tasks, ${overdueTasks.length} overdue tasks, ${pendingDecisions.length} pending decisions.`);

  // 2. Identify unresolved recurring topics
  const detectedRepeatedTopics = identifyRepeatedTopics(previousMeetings, pendingDecisions, pendingTasks);

  let suggestedAgenda = [];
  let repeatedTopics = detectedRepeatedTopics;

  try {
    // 3. Call Gemini AI for deep semantic agenda synthesis
    const geminiResult = await generateFollowUpWithGemini({
      previousMeetings,
      pendingTasks,
      overdueTasks,
      pendingDecisions,
      repeatedTopics: detectedRepeatedTopics
    });

    if (geminiResult.suggestedAgenda && geminiResult.suggestedAgenda.length > 0) {
      suggestedAgenda = geminiResult.suggestedAgenda;
    }
    if (geminiResult.repeatedTopics && geminiResult.repeatedTopics.length > 0) {
      repeatedTopics = geminiResult.repeatedTopics;
    }
    console.log(`[Agent 4: Follow-up Agent] Gemini generated ${suggestedAgenda.length} agenda items.`);
  } catch (error) {
    console.warn('[Agent 4: Follow-up Agent] Gemini call failed, building deterministic agenda from database records:', error.message);

    // Heuristic synthesis fallback ensuring 100% reliability
    suggestedAgenda = [];

    // Agenda Item 1: Overdue Task Resolution
    if (overdueTasks.length > 0) {
      const topOverdue = overdueTasks[0];
      suggestedAgenda.push({
        time: '15 mins',
        topic: `Blocker Resolution: ${topOverdue.title}`,
        leader: topOverdue.owner || 'Project Lead',
        objective: 'Establish definitive revised completion date and remove blockers.',
        rationale: `Deliverable is currently ${topOverdue.daysOverdue} days overdue from meeting "${topOverdue.meetingTitle}".`
      });
    } else {
      suggestedAgenda.push({
        time: '10 mins',
        topic: 'Active Commitments Progress Check',
        leader: 'Team Lead',
        objective: 'Verify velocity on active sprint deliverables.',
        rationale: `${pendingTasks.length} action items currently pending across teams.`
      });
    }

    // Agenda Item 2: Pending Architectural / Product Decisions
    if (pendingDecisions.length > 0) {
      const topDecision = pendingDecisions[0];
      suggestedAgenda.push({
        time: '20 mins',
        topic: `Decision Execution: ${topDecision.title}`,
        leader: topDecision.responsiblePerson || 'Technical Lead',
        objective: 'Review execution plan and confirm deployment timeline.',
        rationale: `Decision status is "${topDecision.implementationStatus}" (${topDecision.category || 'Architecture'}).`
      });
    }

    // Agenda Item 3: Repeated Unresolved Topic
    if (repeatedTopics.length > 0) {
      const topTopic = repeatedTopics[0];
      suggestedAgenda.push({
        time: '15 mins',
        topic: `Unresolved Topic: ${topTopic.topic}`,
        leader: 'Engineering Lead',
        objective: topTopic.recommendation || 'Drive alignment and consensus.',
        rationale: topTopic.frequency || 'Identified as recurring discussion topic across past sessions.'
      });
    }

    // Agenda Item 4: Next Sprint Planning
    suggestedAgenda.push({
      time: '10 mins',
      topic: 'Next Milestones & Resource Allocation',
      leader: 'Product Manager',
      objective: 'Lock deliverables for upcoming sprint cycle.',
      rationale: 'Aligning team bandwidth with priority roadmap items.'
    });
  }

  // 4. Tool Execution: Persist report to MongoDB
  const reportDoc = await saveFollowUpReport({
    suggestedAgenda,
    repeatedTopics,
    outstandingCommitmentsCount: pendingTasks.length,
    pendingDecisionsCount: pendingDecisions.length,
    status: 'Draft'
  });

  return {
    reportId: reportDoc?._id?.toString() || null,
    generatedAt: reportDoc?.generatedAt || new Date().toISOString(),
    suggestedAgenda,
    repeatedTopics,
    outstandingCommitmentsCount: pendingTasks.length,
    overdueTasksCount: overdueTasks.length,
    pendingDecisionsCount: pendingDecisions.length,
    status: reportDoc?.status || 'Draft'
  };
}

/**
 * Retrieve the latest follow-up report from MongoDB
 */
export async function getLatestFollowUpReport() {
  const latest = await FollowUpReport.findOne().sort({ generatedAt: -1 });
  return latest;
}

/**
 * Update an existing follow-up agenda (Manager review & edit)
 */
export async function updateFollowUpReport(reportId, updateData) {
  const updated = await FollowUpReport.findByIdAndUpdate(
    reportId,
    { $set: updateData },
    { new: true, runValidators: true }
  );
  return updated;
}
