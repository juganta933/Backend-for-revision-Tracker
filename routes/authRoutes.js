const express = require("express");

const {
    googleLogin,
    googleCallback,
    registerUser,
    loginUser,
    logoutUser
} = require("../controllers/authController");

const router = express.Router();

router.post("/register", registerUser);

router.post("/login", loginUser);

router.get("/google", googleLogin);

router.get("/google/callback", googleCallback);

router.post("/logout", logoutUser);

module.exports = router;