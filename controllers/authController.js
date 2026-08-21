const User = require("../src/models/User");
const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");


const googleClient = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);


// ===============================
// Helper: Create JWT + Cookie
// ===============================
const createAuthToken = (user, res) => {
    const token = jwt.sign(
        {
            id: user._id
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "7d"
        }
    );

    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return token;
};


const getCurrentUser = async (req, res) => {
    try {
      
        const user = await User
            .findById(req.user.id)
            .select("-password");
       
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.status(200).json({
            user
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error"
        });
    }
};

// ===============================
// Normal Register
// ===============================
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email and password are required"
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        const existingUser = await User.findOne({
            email: normalizedEmail
        });

        if (existingUser) {
            return res.status(400).json({
                message: "User already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email: normalizedEmail,
            password: hashedPassword,
            googleId: null
        });

        createAuthToken(user, res);

        return res.status(201).json({
            message: "User registered successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error("Register error:", error);

        return res.status(500).json({
            message: "Server Error"
        });
    }
};


// ===============================
// Normal Login
// ===============================
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        const user = await User.findOne({
            email: normalizedEmail
        });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // Google-only account
        if (!user.password) {
            return res.status(400).json({
                message:
                    "This account uses Google login. Please continue with Google."
            });
        }

        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordCorrect) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        createAuthToken(user, res);

        return res.status(200).json({
            message: "Login successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error("Login error:", error);

        return res.status(500).json({
            message: "Server Error"
        });
    }
};


// ===============================
// Start Google OAuth
// ===============================
const googleLogin = (req, res) => {
    try {
        const authUrl = googleClient.generateAuthUrl({
            access_type: "offline",

            scope: [
                "openid",
                "profile",
                "email"
            ],

            prompt: "select_account"
        });

        return res.redirect(authUrl);

    } catch (error) {
        console.error("Google OAuth start error:", error);

        return res.status(500).json({
            message: "Unable to start Google authentication"
        });
    }
};


// ===============================
// Google OAuth Callback
// ===============================
const googleCallback = async (req, res) => {
    try {
        const { code } = req.query;

        if (!code) {
            return res.status(400).json({
                message: "Authorization code is missing"
            });
        }

        // Exchange authorization code for Google tokens
        const { tokens } = await googleClient.getToken(code);

        // Verify Google ID token
        const ticket = await googleClient.verifyIdToken({
            idToken: tokens.id_token,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();

        const {
            sub: googleId,
            name,
            email,
            email_verified
        } = payload;

        // Make sure Google verified the email
        if (!email_verified) {
            return res.status(400).json({
                message: "Google email is not verified"
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Find existing user by email
        let user = await User.findOne({
            email: normalizedEmail
        });


        // ===================================
        // User does not exist
        // Create Google account
        // ===================================
        if (!user) {

            user = await User.create({
                name,
                email: normalizedEmail,
                password: null,
                googleId
            });

        }

        // ===================================
        // User exists but Google not linked
        // Link Google account
        // ===================================
        else if (!user.googleId) {

            user.googleId = googleId;

            // Don't change their password.
            // This allows:
            //
            // password login
            // +
            // Google login
            //
            // on the same account.

            await user.save();
        }

        // ===================================
        // User exists and Google is already linked
        // ===================================
        else if (user.googleId !== googleId) {

            return res.status(400).json({
                message:
                    "This email is already linked to another Google account"
            });
        }


        // Create our application's JWT
        createAuthToken(user, res);

        // Redirect to Next.js
        return res.redirect(
            `${process.env.FRONTEND_URL}/dashboard`
        );

    } catch (error) {
        console.error("Google OAuth callback error:", error);

        return res.status(500).json({
            message: "Google authentication failed"
        });
    }
};


// ===============================
// Logout
// ===============================
const logoutUser = (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax"
    });

    return res.status(200).json({
        message: "Logged out successfully"
    });
};


module.exports = {
    registerUser,
    loginUser,
    googleLogin,
    googleCallback,
    logoutUser,
    getCurrentUser
};