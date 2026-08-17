const express = require("express");

const router = express.Router();

const {
  addProblem,
  getProblems,
  getProblem,
  updateProblem,
  deleteProblem,
  reviseProblem,
} = require("../controllers/problemController");

const authMiddleware = require("../middleware/authMiddleware");


// Add problem
router.post("/", authMiddleware, addProblem);

// Get all logged-in user's problems
router.get("/", authMiddleware, getProblems);

// Get one problem
router.get("/:id", authMiddleware, getProblem);

// Update problem
router.put("/:id", authMiddleware, updateProblem);

// Delete problem
router.delete("/:id", authMiddleware, deleteProblem);

// Mark as revised
router.patch("/:id/revise", authMiddleware, reviseProblem);


module.exports = router;