const Problem = require("../src/models/Problems");
const Revision = require("../src/models/Revision");

// ======================================================
// ADD A NEW PROBLEM
// POST /api/problems
// ======================================================

const addProblem = async (req, res) => {
  try {
    const { title, problemLink, platform, difficulty } = req.body;

    // Validation
    if (!title || !problemLink) {
      return res.status(400).json({
        success: false,
        message: "Title and problem link are required",
      });
    }

    // Create problem for currently logged-in user
    const problem = await Problem.create({
      user: req.user.id,
      title,
      problemLink,
      platform: platform || "LeetCode",
      difficulty,
      revisionCount: 0,
      revisions: [],
    });

    return res.status(201).json({
      success: true,
      message: "Problem added successfully",
      problem,
    });
  } catch (error) {
    console.error("Add Problem Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to add problem",
      error: error.message,
    });
  }
};


// ======================================================
// GET ALL PROBLEMS OF LOGGED-IN USER
// GET /api/problems
// ======================================================

const getProblems = async (req, res) => {
  try {
    const problems = await Problem.find({
      user: req.user.id,
    }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: problems.length,
      problems,
    });
  } catch (error) {
    console.error("Get Problems Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch problems",
      error: error.message,
    });
  }
};


// ======================================================
// GET ONE PARTICULAR PROBLEM
// GET /api/problems/:id
// ======================================================

const getProblem = async (req, res) => {
  try {
    const { id } = req.params;

    // Find problem AND make sure it belongs to logged-in user
    const problem = await Problem.findOne({
      _id: id,
      user: req.user.id,
    });

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: "Problem not found",
      });
    }

    return res.status(200).json({
      success: true,
      problem,
    });
  } catch (error) {
    console.error("Get Problem Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch problem",
      error: error.message,
    });
  }
};


// ======================================================
// UPDATE PROBLEM
// PUT /api/problems/:id
// ======================================================

const updateProblem = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      title,
      problemLink,
      platform,
      difficulty,
    } = req.body;

    // Find only user's own problem
    const problem = await Problem.findOne({
      _id: id,
      user: req.user.id,
    });

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: "Problem not found",
      });
    }

    // Update only fields that were provided
    if (title !== undefined) {
      problem.title = title;
    }

    if (problemLink !== undefined) {
      problem.problemLink = problemLink;
    }

    if (platform !== undefined) {
      problem.platform = platform;
    }

    if (difficulty !== undefined) {
      problem.difficulty = difficulty;
    }

    await problem.save();

    return res.status(200).json({
      success: true,
      message: "Problem updated successfully",
      problem,
    });
  } catch (error) {
    console.error("Update Problem Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update problem",
      error: error.message,
    });
  }
};


// ======================================================
// DELETE PROBLEM
// DELETE /api/problems/:id
// ======================================================

const deleteProblem = async (req, res) => {
  try {
    const { id } = req.params;

    // Again, check ownership
    const problem = await Problem.findOne({
      _id: id,
      user: req.user.id,
    });

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: "Problem not found",
      });
    }

    await Problem.deleteOne({
      _id: id,
      user: req.user.id,
    });

    return res.status(200).json({
      success: true,
      message: "Problem deleted successfully",
    });
  } catch (error) {
    console.error("Delete Problem Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete problem",
      error: error.message,
    });
  }
};


// ======================================================
// MARK PROBLEM AS REVISED
// PATCH /api/problems/:id/revise
// ======================================================

const reviseProblem = async (req, res) => {
  try {
    const { id } = req.params;

    // Find problem belonging to current user
    const problem = await Problem.findOne({
      _id: id,
      user: req.user.id,
    });

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: "Problem not found",
      });
    }

    // Increase revision count
    problem.revisionCount += 1;

    // Add revision date to problem
    problem.revisions.push({
      revisedAt: new Date(),
    });

    await problem.save();

    // Create separate revision activity record
    const revision = await Revision.create({
      user: req.user.id,
      problem: problem._id,
      revisedAt: new Date(),
    });

    return res.status(200).json({
      success: true,
      message: "Problem marked as revised",
      revisionCount: problem.revisionCount,
      problem,
      revision,
    });
  } catch (error) {
    console.error("Revise Problem Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to revise problem",
      error: error.message,
    });
  }
};


// ======================================================
// EXPORT ALL CONTROLLERS
// ======================================================

module.exports = {
  addProblem,
  getProblems,
  getProblem,
  updateProblem,
  deleteProblem,
  reviseProblem,
};