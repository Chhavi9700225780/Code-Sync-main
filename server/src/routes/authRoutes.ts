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
// --- GitHub Callback Route ---
router.get('/github/callback',
    passport.authenticate('github', {
        failureRedirect: (process.env.FRONTEND_URL || 'http://localhost:5173') + '/login',
    }),
    // --- Success Handler with Explicit Save ---
    (req, res) => {
        console.log("GitHub callback successful. User:", req.user); // Session IS established here

        const frontendBaseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const returnRoomId = (req.session as any).returnRoomId;
        let redirectUrl = `${frontendBaseUrl}/auth/callback`; // Target frontend callback

        if (returnRoomId) {
             redirectUrl += `?returnTo=/editor/${returnRoomId}`;
             console.log(`Will redirect to frontend auth callback, aiming for editor room: ${returnRoomId}`);
        } else {
             console.log(`Will redirect to frontend auth callback, aiming for homepage.`);
             // Optionally add returnTo for homepage: redirectUrl += `?returnTo=/`;
        }

        // --- !!! EXPLICITLY SAVE SESSION BEFORE REDIRECTING !!! ---
        req.session.save((err) => {
            if (err) {
                console.error("Error saving session before redirect:", err);
                // Redirect to login even on save error, maybe add an error query param
                return res.redirect(`${frontendBaseUrl}/login?error=session_save_failed`);
            }
            
            console.log("Session explicitly saved. Now redirecting to:", redirectUrl);
            // Clean up session variable *after* constructing URL, *before* redirecting
            if (returnRoomId) delete (req.session as any).returnRoomId;
            // if ((req.session as any).returnPath) delete (req.session as any).returnPath;
            
            res.redirect(redirectUrl); // Redirect AFTER save completes
        });
        // --- !!! END EXPLICIT SAVE !!! ---
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
// src/routes/authRoutes.ts
router.get('/status', (req, res) => {
    console.log('--- Received /api/auth/status request ---'); // <-- ADD
    console.log('Session ID:', req.sessionID); // <-- ADD
    // console.log('Full Session Object:', req.session); // Optional: Can be verbose
    console.log('Is Authenticated?', req.isAuthenticated()); // <-- ADD
    console.log('req.user object:', req.user); // <-- ADD (Check if populated)

    if (req.isAuthenticated() && req.user) { // Added check for req.user existence
         const userToSend = { /* ... your sanitized user object ... */ };
         console.log('--- Responding: Authenticated ---'); // <-- ADD
        res.json({ isAuthenticated: true, user: userToSend });
    } else {
         console.log('--- Responding: NOT Authenticated ---'); // <-- ADD
        res.json({ isAuthenticated: false, user: null });
    }
});

export default router;
