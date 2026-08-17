const express = require("express");

const router = express.Router();

const {
  getRevisionActivity,getRevisionStats
} = require("../controllers/revisionController");

const authMiddleware = require("../middleware/authMiddleware");

router.get(
  "/activity",
  authMiddleware,
  getRevisionActivity
);
router.get("/stats",authMiddleware,getRevisionStats)

module.exports = router;