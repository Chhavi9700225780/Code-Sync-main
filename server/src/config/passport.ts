// src/config/passport.ts
import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';
import dotenv from 'dotenv';
import User, { IUser } from '../models/User'; // Import your User model

dotenv.config();

// Ensure GitHub OAuth credentials are set in environment variables
if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET || !process.env.GITHUB_CALLBACK_URL) {
    console.error('FATAL ERROR: GitHub OAuth environment variables (GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, GITHUB_CALLBACK_URL) are not defined.');
    process.exit(1);
}

passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_CALLBACK_URL, // e.g., "https://your-backend.onrender.com/api/auth/github/callback"
    scope: ['repo', 'user:email'] // Request 'repo' access and user email
},
    async (accessToken: string, refreshToken: string, profile: any, done: (error: any, user?: any) => void) => {
        // This function is called after successful GitHub authentication
        const githubId = profile.id;
        const username = profile.username; // GitHub username
        // Try getting email (might be null if private)
        const email = profile.emails && profile.emails[0]?.value;

        console.log(`GitHub auth successful for user: ${username} (ID: ${githubId})`);
        console.log(`Received Access Token: ${accessToken}`); // Sensitive - maybe only log first few chars in production

        try {
            // Find or create user in your database
            let user = await User.findOne({ githubId: githubId });

            if (user) {
                // User exists, update access token if necessary
                if (user.githubAccessToken !== accessToken) {
                    user.githubAccessToken = accessToken; // Store the latest token
                    await user.save();
                    console.log(`Updated GitHub access token for user ${username}`);
                }
                return done(null, user); // Pass user object to serializeUser
            } else {
                // New user - create them in your database
                // You might need a way to link this to your app's internal user ID
                // For now, let's create a basic user
                const newUser = new User({
                    // appUserId: generateUniqueAppId(), // Generate or link an ID for your app
                    username: username, // Consider if this should be unique or if you allow multiple GitHub accounts?
                    githubId: githubId,
                    githubAccessToken: accessToken,
                    // email: email, // Add email if needed
                });
                await newUser.save();
                console.log(`Created new user ${username} from GitHub login.`);
                return done(null, newUser); // Pass new user object to serializeUser
            }
        } catch (err) {
            console.error("Error during GitHub OAuth user find/create:", err);
            return done(err, false);
        }
    }
));

// --- Serialization/Deserialization ---
// Tells Passport how to save the user ID into the session
passport.serializeUser((user: any, done) => {
    done(null, user.id); // Save MongoDB '_id' into the session
});

// Tells Passport how to retrieve the full user object from the session ID
passport.deserializeUser(async (id: string, done) => {
    try {
        const user = await User.findById(id);
        done(null, user); // Attach user object to req.user
    } catch (err) {
        done(err, null);
    }
});