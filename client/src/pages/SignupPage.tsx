import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
// Assuming pages are in 'src/pages' and context is in 'src/context'
import { useAuth, api } from '../context/AuthContext'; 

const SignupPage = () => {
    const [formData, setFormData] = useState({
        username: '', // <-- ADDED
        email: '',
        password: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { setUser } = useAuth(); 

    const backendUrl = import.meta.env.VITE_BACKEND_URL; // Or from your env

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleGitHubLogin = () => {
        // This can point to the same URL, the backend handles it
        window.location.href = `${backendUrl}/api/auth/github`;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        toast.loading('Creating your account...'); // <-- UPDATED TEXT

        try {
            // The 'api' instance from AuthContext already has withCredentials
            const response = await api.post('/api/auth/register', formData); // <-- CORRECT ENDPOINT

            toast.dismiss();
            toast.success('Account created successfully!');

            const { user } = response.data;
            
            // Log the user in globally since the backend session is created
            setUser(user); 
            console.log("Registered and logged in user:", user);

            navigate('/'); // Redirect to home
        } catch (error: any) {
            toast.dismiss();
            const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
            toast.error(errorMessage);
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
            <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-lg">
                <h1 className="text-3xl font-bold text-center text-primary">Create an Account</h1> {/* <-- UPDATED TEXT */}
                
                <button
                    onClick={handleGitHubLogin}
                    className="w-full p-3 font-bold text-white bg-gray-700 rounded-md hover:bg-gray-600 transition"
                >
                    Sign Up with GitHub {/* <-- UPDATED TEXT */}
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
                        <label className="text-sm font-bold text-gray-400">Username</label> {/* <-- ADDED FIELD */}
                        <input
                            type="text"
                            name="username"
                            onChange={handleChange}
                            required
                            className="w-full p-3 mt-1 text-white bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
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
                        {isLoading ? 'Signing Up...' : 'Sign Up'} {/* <-- UPDATED TEXT */}
                    </button>
                </form>
                <p className="text-center text-gray-400">
                    Already have an account?{' '} {/* <-- UPDATED TEXT */}
                    <Link to="/login" className="font-bold text-primary hover:underline">
                        Log In
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default SignupPage;


