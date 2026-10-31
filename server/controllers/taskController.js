import { Task } from '../models/Task.js';
import { Meeting } from '../models/Meeting.js';

// @desc    Create a new task
// @route   POST /api/tasks
export const createTask = async (req, res, next) => {
  try {
    const {
      title,
      description,
      owner,
      ownerAvatar,
      deadline,
      priority,
      status,
      meetingId
    } = req.body;

    if (!title || !owner || !deadline || !meetingId) {
      res.status(400);
      throw new Error('Title, owner, deadline, and meetingId are required fields.');
    }

    const meeting = await Meeting.findById(meetingId);
    if (!meeting) {
      res.status(404);
      throw new Error('Originating meeting not found.');
    }

    const task = await Task.create({
      title,
      description: description || '',
      owner,
      ownerAvatar: ownerAvatar || owner.slice(0, 2).toUpperCase(),
      deadline,
      priority: priority || 'Medium',
      status: status || 'Pending',
      meetingId,
      meetingTitle: meeting.title
    });

    res.status(201).json({
      success: true,
      data: task
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all tasks with filtering
// @route   GET /api/tasks
export const getTasks = async (req, res, next) => {
  try {
    const { search, status, owner, priority, meetingId } = req.query;
    const query = {};

    if (meetingId) {
      query.meetingId = meetingId;
    }

    if (status && status !== 'All') {
      if (status === 'Overdue') {
        // Handled via post-filter or virtual
        query.status = { $ne: 'Completed' };
      } else {
        query.status = status;
      }
    }

    if (owner && owner !== 'All') {
      query.owner = owner;
    }

    if (priority && priority !== 'All') {
      query.priority = priority;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { owner: { $regex: search, $options: 'i' } },
        { meetingTitle: { $regex: search, $options: 'i' } }
      ];
    }

    let tasks = await Task.find(query).sort({ deadline: 1 });

    if (status === 'Overdue') {
      tasks = tasks.filter((t) => t.isOverdue);
    }

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get task by ID
// @route   GET /api/tasks/:id
export const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task status or attributes
// @route   PUT /api/tasks/:id
export const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    const updateData = { ...req.body };

    // If status is updated to Completed, record completedAt timestamp
    if (req.body.status === 'Completed' && task.status !== 'Completed') {
      updateData.completedAt = new Date();
    } else if (req.body.status && req.body.status !== 'Completed') {
      updateData.completedAt = null;
    }

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: updatedTask
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
export const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    await Task.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Task successfully deleted.'
    });
  } catch (error) {
    next(error);
  }
};
