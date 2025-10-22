// src/routes/authRoutes.ts
import express from 'express';
import passport from 'passport';
import dotenv from 'dotenv';
import User from '../models/User';
import { registerUser, loginUser, getAuthStatus } from '../controllers/authController';
const jwt = require("jsonwebtoken");

dotenv.config();
const router = express.Router();

// --- Route to start GitHub login ---

// POST /api/auth/register
router.post('/register', registerUser);

// POST /api/auth/login
router.post('/login', loginUser);

// GET /api/auth/github
router.get('/github',
    // Save the intended destination before redirecting (optional)
    (req, res, next) => {
        // You could store req.headers.referer or a query param in the session
        // req.session.returnTo = req.query.returnTo || '/';
        // Assuming you can get roomId from query or referer
                            // @ts-expect-error TS2345 - Suppressing ArrayBufferLike error temporarily
        const roomId = req.query.roomId || req.session.currentRoomId; // Get roomId somehow
        if (roomId) {
                                // @ts-expect-error TS2345 - Suppressing ArrayBufferLike error temporarily
            req.session.returnRoomId = roomId; // Store it
            console.log(`Storing returnRoomId in session: ${roomId}`);
        } else {
            // Store a default return path if roomId isn't available
            // @ts-expect-error TS2345 - Suppressing ArrayBufferLike error temporarily
             req.session.returnPath = '/'; // Or some other default
             console.log("Storing default returnPath in session: /");
        }
        // --- End storing ---
        next();
    },
    passport.authenticate('github', { scope: ['repo', 'user:email'] }) // Redirects user to GitHub
);

// --- GitHub Callback Route ---
// GET /api/auth/github/callback
router.get('/github/callback',
    passport.authenticate('github', {
        failureRedirect: process.env.FRONTEND_URL || 'http://localhost:5173', // Redirect on failure
        // failureMessage: true // Optional: store failure message in session flash
    }),
    (req, res) => {
        // Successful authentication!
        console.log("GitHub callback successful. User:", req.user); // req.user is populated by Passport deserializeUser

        // Redirect user back to the frontend dashboard or original page
        // const returnTo = req.session.returnTo || '/dashboard'; // Example redirect
        // delete req.session.returnTo; // Clean up session
     // Redirect to frontend
     // --- Redirect back to the editor page or homepage ---
                         // @ts-expect-error TS2345 - Suppressing ArrayBufferLike error temporarily
        const returnRoomId = req.session.returnRoomId;
        const frontendBaseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        let redirectUrl = frontendBaseUrl + '/'; // Default to homepage

        if (returnRoomId) {
            redirectUrl = `${frontendBaseUrl}/editor/${returnRoomId}`; // Construct editor URL
            console.log(`Redirecting back to editor room: ${redirectUrl}`);
                                // @ts-expect-error TS2345 - Suppressing ArrayBufferLike error temporarily
            delete req.session.returnRoomId; // Clean up session
        } else {
             console.log(`Redirecting back to homepage: ${redirectUrl}`);
             // Optionally use req.session.returnPath if you stored it
             // delete req.session.returnPath;
        }

        res.redirect(redirectUrl);
    }
);

// --- (Optional) Logout Route ---
// GET /api/auth/logout
router.get('/logout', (req, res, next) => {
    req.logout((err) => { // req.logout requires a callback
        if (err) { return next(err); }
        req.session.destroy((err) => { // Destroy the session
            if (err) {
                 console.error("Error destroying session:", err);
                 return next(err);
            }
            res.clearCookie('connect.sid'); // Clear the session cookie
            // Redirect to frontend homepage or login page
            res.status(200).json({ message: "Logged out successfully." });
        });
    });
});

// --- (Optional) Route to check auth status ---
// GET /api/auth/status
router.get('/status', (req, res) => {
    if (req.isAuthenticated()) {
        res.json({ isAuthenticated: true, user: req.user }); // Send back user data if logged in
    } else {
        res.json({ isAuthenticated: false });
    }
});


export default router;