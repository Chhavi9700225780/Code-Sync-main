// src/routes/authRoutes.ts
import express from 'express';
import passport from 'passport';
import dotenv from 'dotenv';
// No longer need User model import here unless used elsewhere
// import User from '../models/User';
import { registerUser, loginUser, getAuthStatus } from '../controllers/authController';
// Remove unused jwt require
// const jwt = require("jsonwebtoken");

dotenv.config();
const router = express.Router();

// POST /api/auth/register
router.post('/register', registerUser);

// POST /api/auth/login
router.post('/login', loginUser);

// GET /api/auth/github
router.get('/github',
    // Middleware to store potential return path (like roomId)
    (req, res, next) => {
        // Use req.session directly, no need for @ts-expect-error if session is typed
        const roomId = req.query.roomId as string || (req.session as any).currentRoomId;
        if (roomId) {
            (req.session as any).returnRoomId = roomId;
            console.log(`Storing returnRoomId in session: ${roomId}`);
        } else {
            // Store a default return path if roomId isn't available
             (req.session as any).returnPath = '/'; // Or some other default
             console.log("Storing default returnPath in session: /");
        }
        next();
    },
    passport.authenticate('github', { scope: ['user:email'] }) // Reduced scope if 'repo' not needed
);

// --- GitHub Callback Route ---
// GET /api/auth/github/callback
router.get('/github/callback',
    passport.authenticate('github', {
        // Redirect to frontend login on failure
        failureRedirect: (process.env.FRONTEND_URL || 'http://localhost:5173') + '/login',
        // failureMessage: true // Optional
    }),
    // --- THIS IS THE SUCCESS HANDLER ---
    (req, res) => {
        // Successful authentication! Passport adds user to req.user and session is created.
        console.log("GitHub callback successful. User:", req.user);

        const frontendBaseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

        // --- !!! CHANGE IS HERE !!! ---
        // Redirect to a specific frontend callback route, NOT the homepage directly.
        // We'll append the original intended roomId if it exists, so the frontend can use it later.
        const returnRoomId = (req.session as any).returnRoomId;
        let redirectUrl = `${frontendBaseUrl}/auth/callback`; // Redirect to frontend callback

        if (returnRoomId) {
             // Append roomId as a query param for the frontend callback page
             redirectUrl += `?returnTo=/editor/${returnRoomId}`;
             console.log(`Redirecting to frontend auth callback, aiming for editor room: ${returnRoomId}`);
             delete (req.session as any).returnRoomId; // Clean up session
        } else {
             console.log(`Redirecting to frontend auth callback, aiming for homepage.`);
             // Optionally use returnPath if needed: redirectUrl += `?returnTo=${(req.session as any).returnPath || '/'}`;
             // delete (req.session as any).returnPath;
        }
        // --- !!! END CHANGE !!! ---

        res.redirect(redirectUrl);
    }
);

// GET /api/auth/logout
router.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) { return next(err); }
        req.session.destroy((err) => {
            if (err) {
                 console.error("Error destroying session:", err);
                 // Still try to clear cookie and respond
            }
            res.clearCookie('connect.sid'); // Use the default cookie name
            // Send success status, frontend handles redirect
            res.status(200).json({ message: "Logged out successfully." });
        });
    });
});

// GET /api/auth/status
router.get('/status', (req, res) => {
    if (req.isAuthenticated()) {
        // Send back a sanitized user object
        const userToSend = {
             id: (req.user as any).appUserId, // Assuming appUserId is the ID you want on frontend
             username: (req.user as any).username,
             email: (req.user as any).email,
             // Add any other SAFE fields you need on the frontend
        };
        res.json({ isAuthenticated: true, user: userToSend });
    } else {
        res.json({ isAuthenticated: false, user: null }); // Explicitly send user: null
    }
});

export default router;
