// src/routes/authRoutes.ts
import express from 'express';
import passport from 'passport';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

// --- Route to start GitHub login ---
// GET /api/auth/github
router.get('/github',
    // Save the intended destination before redirecting (optional)
    (req, res, next) => {
        // You could store req.headers.referer or a query param in the session
        // req.session.returnTo = req.query.returnTo || '/';
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
        res.redirect(process.env.FRONTEND_URL || 'http://localhost:5173'); // Redirect to frontend
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
            res.redirect(process.env.FRONTEND_URL || 'http://localhost:5173');
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