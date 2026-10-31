import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';

// ============================================================================
// Zod Validation Schemas
// ============================================================================

export const ActionItemSchema = z.object({
  title: z.string().min(1, 'Action item title is required'),
  description: z.string().optional().default(''),
  owner: z.string().nullable().optional().transform((val) => (val && val.trim() ? val.trim() : null)),
  deadline: z.string().nullable().optional().transform((val) => (val && val.trim() ? val.trim() : null)),
  priority: z.enum(['High', 'Medium', 'Low']).default('Medium')
});

export const DecisionSchema = z.object({
  title: z.string().min(1, 'Decision title is required'),
  description: z.string().optional().default(''),
  responsiblePerson: z.string().nullable().optional().transform((val) => (val && val.trim() ? val.trim() : null)),
  implementationStatus: z.enum(['Decided', 'In Progress', 'Implemented']).default('Decided'),
  category: z.string().default('Architecture'),
  rationale: z.string().optional().default('')
});

export const DiscussionPointSchema = z.object({
  topic: z.string().min(1, 'Discussion topic is required'),
  notes: z.string().min(1, 'Discussion notes are required'),
  speaker: z.string().default('Team Member')
});

export const FollowUpTopicSchema = z.object({
  topic: z.string().min(1, 'Follow-up topic is required'),
  context: z.string().optional().default(''),
  recommendation: z.string().optional().default('')
});

export const MeetingAnalysisSchema = z.object({
  summary: z.string().min(1, 'Meeting summary is required'),
  discussionPoints: z.array(DiscussionPointSchema).default([]),
  importantOutcomes: z.array(z.string()).default([]),
  actionItems: z.array(ActionItemSchema).default([]),
  decisions: z.array(DecisionSchema).default([]),
  followUpTopics: z.array(FollowUpTopicSchema).default([])
});

// ============================================================================
// Reusable Gemini AI Service
// ============================================================================

let aiClient = null;

function getAiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
    throw new Error('GEMINI_API_KEY is not configured in server/.env. Please set a valid Gemini API key.');
  }

  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

/**
 * Analyzes meeting transcripts and discussion notes using Gemini AI
 * Extracts summary, discussion points, action items, decisions, and follow-up topics
 */
export async function analyzeMeetingWithGemini({
  title,
  date,
  time,
  participants,
  description,
  transcript
}) {
  const ai = getAiClient();

  const systemInstruction = `You are Agent 1: Meeting Analysis Agent for MeetMind AI – an intelligent agentic meeting intelligence and action management system.
Your mission is to perform deep semantic analysis on raw meeting transcripts and discussion notes, deconstructing the conversation into structured, verifiable deliverables and decisions.

CRITICAL RULES:
1. Zero Hallucination for Owners: NEVER invent task owners or participants. If a commitment does not specify who is responsible, return null for owner.
2. Zero Hallucination for Deadlines: NEVER invent deadlines. If a commitment does not state a target date, return null for deadline.
3. Resolve Relative Deadlines: Use the meeting date (${date || new Date().toISOString().split('T')[0]}) as the anchor reference to resolve relative dates (e.g. 'by Friday', 'by next Tuesday', 'in 3 days') into ISO YYYY-MM-DD strings.
4. Confirmed Decisions Only: Do NOT classify casual ideas, suggestions, hypotheses, or open questions as confirmed decisions. Only extract clear agreements or explicit consensus.
5. Distinction of Tasks vs Discussion: Clearly differentiate an action item deliverable (someone committed to doing something) from general informational commentary.

Output MUST be strictly valid JSON conforming to the requested schema.`;

  const userPrompt = `Please analyze the following meeting discussion:

Meeting Title: ${title || 'Team Meeting'}
Meeting Date: ${date || '2026-11-01'}
Meeting Time: ${time || '10:00 AM'}
Expected Participants: ${Array.isArray(participants) ? participants.map((p) => p.name || p).join(', ') : participants || 'Team'}
Meeting Context/Purpose: ${description || 'Not specified'}

Raw Meeting Transcript / Discussion Notes:
"""
${transcript}
"""

Extract:
1. "summary": A clear, executive-level summary of the overall meeting.
2. "discussionPoints": Array of { "topic", "notes", "speaker" } capturing key debate and alignment.
3. "importantOutcomes": Array of key outcome statements.
4. "actionItems": Array of { "title", "description", "owner", "deadline", "priority" } (priority in 'High', 'Medium', 'Low').
5. "decisions": Array of { "title", "description", "responsiblePerson", "implementationStatus", "category", "rationale" } (implementationStatus in 'Decided', 'In Progress', 'Implemented').
6. "followUpTopics": Array of { "topic", "context", "recommendation" } for unresolved or recurring topics.`;

  // Call Gemini using @google/genai SDK
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: userPrompt,
    config: {
      systemInstruction,
      responseMimeType: 'application/json',
      temperature: 0.2
    }
  });

  const responseText = response.text;
  if (!responseText) {
    throw new Error('Gemini API returned an empty response.');
  }

  // Parse JSON response
  let rawJson;
  try {
    rawJson = JSON.parse(responseText);
  } catch (parseError) {
    // Attempt cleaning markdown fences if present
    const cleaned = responseText.replace(/```(?:json)?/g, '').trim();
    rawJson = JSON.parse(cleaned);
  }

  // Validate with Zod
  const validatedAnalysis = MeetingAnalysisSchema.parse(rawJson);
  return validatedAnalysis;
}
