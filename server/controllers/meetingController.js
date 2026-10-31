import { Meeting } from '../models/Meeting.js';
import { Task } from '../models/Task.js';
import { Decision } from '../models/Decision.js';

// @desc    Create a new meeting (with optional initial extracted tasks & decisions)
// @route   POST /api/meetings
export const createMeeting = async (req, res, next) => {
  try {
    const {
      title,
      date,
      time,
      duration,
      participants,
      transcript,
      summary,
      discussionPoints,
      status,
      extractedTasks,
      extractedDecisions
    } = req.body;

    if (!title || !date || !transcript) {
      res.status(400);
      throw new Error('Title, date, and transcript are required fields.');
    }

    // 1. Create Meeting
    const meeting = await Meeting.create({
      title,
      date,
      time: time || '10:00 AM',
      duration: duration || '60 mins',
      participants: Array.isArray(participants) ? participants : [],
      transcript,
      summary: summary || '',
      discussionPoints: Array.isArray(discussionPoints) ? discussionPoints : [],
      status: status || 'Draft'
    });

    // 2. If extracted tasks were provided in payload, link and insert them
    let createdTasks = [];
    if (Array.isArray(extractedTasks) && extractedTasks.length > 0) {
      const taskDocs = extractedTasks.map((t) => ({
        title: t.title,
        description: t.description || '',
        owner: t.owner || 'Unassigned',
        ownerAvatar: t.ownerAvatar || (t.owner ? t.owner.slice(0, 2).toUpperCase() : 'TM'),
        deadline: t.deadline || date,
        priority: t.priority || 'Medium',
        status: t.status || 'Pending',
        meetingId: meeting._id,
        meetingTitle: meeting.title
      }));
      createdTasks = await Task.insertMany(taskDocs);
    }

    // 3. If extracted decisions were provided in payload, link and insert them
    let createdDecisions = [];
    if (Array.isArray(extractedDecisions) && extractedDecisions.length > 0) {
      const decisionDocs = extractedDecisions.map((d) => ({
        title: d.title,
        description: d.description || '',
        responsiblePerson: d.responsiblePerson || d.owner || 'Engineering Team',
        implementationStatus: d.implementationStatus || d.status || 'Decided',
        category: d.category || 'Architecture',
        rationale: d.rationale || '',
        meetingId: meeting._id,
        meetingTitle: meeting.title
      }));
      createdDecisions = await Decision.insertMany(decisionDocs);
    }

    res.status(201).json({
      success: true,
      data: meeting,
      createdTasks,
      createdDecisions
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all meetings with filtering and search
// @route   GET /api/meetings
export const getMeetings = async (req, res, next) => {
  try {
    const { search, status, sort } = req.query;
    const query = {};

    if (status && status !== 'All') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { summary: { $regex: search, $options: 'i' } },
        { 'participants.name': { $regex: search, $options: 'i' } }
      ];
    }

    const meetings = await Meeting.find(query)
      .sort({ date: -1, createdAt: -1 });

    // Populate action items and decisions count
    const enrichedMeetings = await Promise.all(
      meetings.map(async (m) => {
        const actionItemsCount = await Task.countDocuments({ meetingId: m._id });
        const decisionsCount = await Decision.countDocuments({ meetingId: m._id });
        const obj = m.toObject();
        return {
          ...obj,
          actionItemsCount,
          decisionsCount
        };
      })
    );

    res.status(200).json({
      success: true,
      count: enrichedMeetings.length,
      data: enrichedMeetings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single meeting by ID with populated tasks and decisions
// @route   GET /api/meetings/:id
export const getMeetingById = async (req, res, next) => {
  try {
    const meeting = await Meeting.findById(req.params.id);

    if (!meeting) {
      res.status(404);
      throw new Error('Meeting not found');
    }

    const tasks = await Task.find({ meetingId: meeting._id });
    const decisions = await Decision.find({ meetingId: meeting._id });

    res.status(200).json({
      success: true,
      data: {
        ...meeting.toObject(),
        tasks,
        decisions,
        actionItemsCount: tasks.length,
        decisionsCount: decisions.length
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update meeting details / approval status
// @route   PUT /api/meetings/:id
export const updateMeeting = async (req, res, next) => {
  try {
    const meeting = await Meeting.findById(req.params.id);

    if (!meeting) {
      res.status(404);
      throw new Error('Meeting not found');
    }

    const updatedMeeting = await Meeting.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: updatedMeeting
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete meeting and linked tasks/decisions
// @route   DELETE /api/meetings/:id
export const deleteMeeting = async (req, res, next) => {
  try {
    const meeting = await Meeting.findById(req.params.id);

    if (!meeting) {
      res.status(404);
      throw new Error('Meeting not found');
    }

    // Cascade delete linked tasks & decisions
    await Task.deleteMany({ meetingId: meeting._id });
    await Decision.deleteMany({ meetingId: meeting._id });
    await Meeting.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Meeting and associated tasks/decisions successfully deleted.'
    });
  } catch (error) {
    next(error);
  }
};
