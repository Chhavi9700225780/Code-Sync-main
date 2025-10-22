import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
//import axios from 'axios';
import toast from 'react-hot-toast';
// import { useAppContext } from '../context/AppContext'; // <-- You will need this!
import { useAuth, api } from '../context/AuthContext';
const LoginPage = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { setUser } = useAuth();
    // const { setCurrentUser } = useAppContext(); // <-- Get your context function

    const backendUrl = process.env.VITE_BACKEND_URL; // Or from import.meta.env.VITE_BACKEND_URL

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleGitHubLogin = () => {
        // Simply redirect to the backend's GitHub auth route
        // The backend will handle the rest and redirect back to the frontend
        window.location.href = `${backendUrl}/api/auth/github`;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        toast.loading('Logging in...');

        try {
            const response = await api.post(
                '/api/auth/login', 
                formData,
                { withCredentials: true } // <-- CRITICAL: Send session cookie
            );

            toast.dismiss();
            toast.success('Logged in successfully!');

            // --- ALL CHANGES ARE HERE ---
            // 1. NO MORE TOKEN!
            // localStorage.setItem('authToken', response.data.token); // <-- DELETE THIS
            
            // 2. Get user object from response
            const { user } = response.data;
            // 3. Save user to your global state (React Context, Zustand, etc.)
            // setCurrentUser(user); // <-- TODO: Uncomment and use your context setter
            console.log("Logged in user:", user); // For testing

            
            setUser(user); // <-- Set the user in the global context

            navigate('/');
        } catch (error: any) {
            toast.dismiss();
            const errorMessage = error.response?.data?.message || 'Login failed. Please check your credentials.';
            toast.error(errorMessage);
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
            <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-lg">
                <h1 className="text-3xl font-bold text-center text-primary">Welcome Back!</h1>
                
                {/* GitHub Login Button */}
                <button
                    onClick={handleGitHubLogin}
                    className="w-full p-3 font-bold text-white bg-gray-700 rounded-md hover:bg-gray-600 transition"
                >
                    Log In with GitHub
                </button>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-600" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-gray-800 text-gray-400">
                            Or continue with email
                        </span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="text-sm font-bold text-gray-400">Email</label>
                        <input
                            type="email"
                            name="email"
                            onChange={handleChange}
                            required
                            className="w-full p-3 mt-1 text-white bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-bold text-gray-400">Password</label>
                        <input
                            type="password"
                            name="password"
                            onChange={handleChange}
                            required
                            className="w-full p-3 mt-1 text-white bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full p-3 font-bold text-black bg-primary rounded-md disabled:opacity-50 hover:bg-green-400 transition"
                    >
                        {isLoading ? 'Logging In...' : 'Log In'}
                    </button>
                </form>
                <p className="text-center text-gray-400">
                    Don't have an account?{' '}
                    <Link to="/signup" className="font-bold text-primary hover:underline">
                        Sign Up
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
