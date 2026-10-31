import { Decision } from '../models/Decision.js';
import { Meeting } from '../models/Meeting.js';

// @desc    Create a new decision
// @route   POST /api/decisions
export const createDecision = async (req, res, next) => {
  try {
    const {
      title,
      description,
      responsiblePerson,
      implementationStatus,
      category,
      rationale,
      meetingId
    } = req.body;

    if (!title || !meetingId) {
      res.status(400);
      throw new Error('Title and meetingId are required fields.');
    }

    const meeting = await Meeting.findById(meetingId);
    if (!meeting) {
      res.status(404);
      throw new Error('Originating meeting not found.');
    }

    const decision = await Decision.create({
      title,
      description: description || '',
      responsiblePerson: responsiblePerson || 'Engineering Team',
      implementationStatus: implementationStatus || 'Decided',
      category: category || 'Architecture',
      rationale: rationale || '',
      meetingId,
      meetingTitle: meeting.title
    });

    res.status(201).json({
      success: true,
      data: decision
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all decisions with filtering and search
// @route   GET /api/decisions
export const getDecisions = async (req, res, next) => {
  try {
    const { search, status, category, meetingId } = req.query;
    const query = {};

    if (meetingId) {
      query.meetingId = meetingId;
    }

    if (status && status !== 'All') {
      query.implementationStatus = status;
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { responsiblePerson: { $regex: search, $options: 'i' } },
        { meetingTitle: { $regex: search, $options: 'i' } }
      ];
    }

    const decisions = await Decision.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: decisions.length,
      data: decisions
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get decision by ID
// @route   GET /api/decisions/:id
export const getDecisionById = async (req, res, next) => {
  try {
    const decision = await Decision.findById(req.params.id);

    if (!decision) {
      res.status(404);
      throw new Error('Decision not found');
    }

    res.status(200).json({
      success: true,
      data: decision
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update decision status / attributes
// @route   PUT /api/decisions/:id
export const updateDecision = async (req, res, next) => {
  try {
    const decision = await Decision.findById(req.params.id);

    if (!decision) {
      res.status(404);
      throw new Error('Decision not found');
    }

    const updatedDecision = await Decision.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: updatedDecision
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete decision
// @route   DELETE /api/decisions/:id
export const deleteDecision = async (req, res, next) => {
  try {
    const decision = await Decision.findById(req.params.id);

    if (!decision) {
      res.status(404);
      throw new Error('Decision not found');
    }

    await Decision.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Decision successfully deleted.'
    });
  } catch (error) {
    next(error);
  }
};
