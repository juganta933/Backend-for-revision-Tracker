const express = require("express");

const {
    googleLogin,
    googleCallback,
    registerUser,
    loginUser,
    logoutUser,getCurrentUser
} = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");


const router = express.Router();

router.post("/register", registerUser);

router.post("/login", loginUser);

router.get("/google", googleLogin);
router.get("/me", authMiddleware, getCurrentUser);

router.get("/google/callback", googleCallback);

router.post("/logout", logoutUser);

module.exports = router;