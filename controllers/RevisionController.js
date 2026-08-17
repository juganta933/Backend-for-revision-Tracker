const mongoose = require("mongoose");
const Revision = require("../src/models/Revision");

// ======================================================
// GET REVISION ACTIVITY
// GET /api/revisions/activity
// ======================================================

const getRevisionActivity = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const activity = await Revision.aggregate([
      {
        $match: {
          user: userId,
        },
      },

      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$revisedAt",
            },
          },

          count: {
            $sum: 1,
          },
        },
      },

      {
        $project: {
          _id: 0,
          date: "$_id",
          count: 1,
        },
      },

      {
        $sort: {
          date: 1,
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      activity,
    });

  } catch (error) {
    console.error("Get Revision Activity Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch revision activity",
      error: error.message,
    });
  }
};
// ======================================================
// GET REVISION STATS
// GET /api/revisions/stats
// ======================================================

const getRevisionStats = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    // Get all revisions of the logged-in user
    const revisions = await Revision.find({
      user: userId,
    })
      .sort({
        revisedAt: 1,
      })
      .select("revisedAt");

    // Total number of revisions
    const totalRevisions = revisions.length;

    // Get unique revision dates
    const uniqueDates = [
      ...new Set(
        revisions.map((revision) => {
          return new Date(revision.revisedAt)
            .toISOString()
            .split("T")[0];
        })
      ),
    ];

    // Number of active days
    const activeDays = uniqueDates.length;

    // Convert dates into Date objects
    const dates = uniqueDates.map((date) => new Date(date));

    let currentStreak = 0;
    let longestStreak = 0;

    // --------------------------------------------------
    // Calculate longest streak
    // --------------------------------------------------

    let streak = 0;

    for (let i = 0; i < dates.length; i++) {
      if (i === 0) {
        streak = 1;
      } else {
        const previousDate = dates[i - 1];
        const currentDate = dates[i];

        const difference =
          (currentDate - previousDate) /
          (1000 * 60 * 60 * 24);

        if (difference === 1) {
          streak++;
        } else {
          streak = 1;
        }
      }

      longestStreak = Math.max(
        longestStreak,
        streak
      );
    }

    // --------------------------------------------------
    // Calculate current streak
    // --------------------------------------------------

    if (dates.length > 0) {
      const today = new Date();

      today.setHours(0, 0, 0, 0);

      const lastActivity =
        dates[dates.length - 1];

      lastActivity.setHours(0, 0, 0, 0);

      const daysSinceLastActivity =
        (today - lastActivity) /
        (1000 * 60 * 60 * 24);

      // Current streak only exists if user
      // was active today or yesterday
      if (
        daysSinceLastActivity === 0 ||
        daysSinceLastActivity === 1
      ) {
        currentStreak = 1;

        for (let i = dates.length - 1; i > 0; i--) {
          const currentDate = dates[i];
          const previousDate = dates[i - 1];

          const difference =
            (currentDate - previousDate) /
            (1000 * 60 * 60 * 24);

          if (difference === 1) {
            currentStreak++;
          } else {
            break;
          }
        }
      }
    }

    return res.status(200).json({
      success: true,

      stats: {
        totalRevisions,
        activeDays,
        currentStreak,
        longestStreak,
      },
    });

  } catch (error) {
    console.error(
      "Get Revision Stats Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch revision stats",
      error: error.message,
    });
  }
};

module.exports = {
  getRevisionActivity,
  getRevisionStats,
};