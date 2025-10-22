
import bcrypt from 'bcryptjs';
//import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import User from '../models/User';

// --- User Registration ---
export const registerUser = async (req: Request, res: Response, next: NextFunction) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Please provide all required fields.' });
    }

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: 'User with this email already exists.' });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create a new user
        const newUser = new User({
            appUserId: uuidv4(),
            username,
            email,
            password: hashedPassword,
        });

        // v-- FIX 3: Assign the result of .save() to 'savedUser'
        const savedUser = await newUser.save();

       // --- CHANGE HERE ---
        // Instead of generating a JWT, log the user into the session
        req.login(savedUser, (err) => {
            if (err) {
                console.error('Session login error after registration:', err);
                return next(err); // Pass error to error handler
            }
            
            // Session is created. Send back user data (no token).
            res.status(201).json({
                message: 'User registered successfully.',
                // token: (REMOVED)
                user: {
                    id: savedUser.appUserId,
                    username: savedUser.username,
                    email: savedUser.email,
                },
            });
        });
        // --- END CHANGE ---

        
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ message: 'Server error during registration.' });
    }
};

// --- User Login ---
// --- User Login ---
export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Please provide email and password.' });
    }

    try {
        // Find user by email (include password in the result)
        const user = await User.findOne({ email }).select('+password');
        if (!user || !user.password) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        // Compare passwords
        // v-- FIX IS HERE --v
        const isMatch = await bcrypt.compare(password, user.password as string);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        // --- CHANGE HERE ---
        // Instead of generating a JWT, log the user into the session
        req.login(user, (err) => {
            if (err) {
                console.error('Session login error:', err);
                return next(err); // Pass error to error handler
            }

            // Session is created. Send back user data (no token).
            res.status(200).json({
                message: 'Login successful.',
                // token: (REMOVED)
                user: {
                    id: user.appUserId,
                    username: user.username,
                    email: user.email,
                },
            });
        });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'Server error during login.' });
    }
};

// --- Get Auth Status (from previous steps) ---
export const getAuthStatus = (req: Request, res: Response) => {
    if (req.isAuthenticated()) {
        res.json({ isAuthenticated: true, user: req.user });
    } else {
        // We can add JWT check here later if needed
        res.json({ isAuthenticated: false });
    }
};
