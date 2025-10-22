import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
// Attempting a path relative to the src directory
import { useAuth, api } from 'src/context/AuthContext'; 
import toast from 'react-hot-toast';

const AuthCallback: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation(); // To get query parameters like returnTo
    const { setUser } = useAuth();
    const [message, setMessage] = useState('Authenticating with GitHub...');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const verifySession = async () => {
            try {
                // Call backend status endpoint. Cookie should be sent automatically.
                const response = await api.get('/api/auth/status');

                if (response.data.isAuthenticated && response.data.user) {
                    console.log("Auth callback success, user:", response.data.user);
                    setUser(response.data.user); // Update global state
                    toast.success('Successfully logged in with GitHub!');

                    // Check if there's a specific return path in query params
                    const queryParams = new URLSearchParams(location.search);
                    const returnTo = queryParams.get('returnTo');

                    // Redirect to the intended page or homepage
                    navigate(returnTo || '/', { replace: true });

                } else {
                    // This case shouldn't happen often if backend redirect only occurs on success
                    console.error("Auth callback: /api/auth/status returned not authenticated.");
                    setError('Authentication failed. Please try logging in again.');
                    toast.error('Authentication failed.');
                     // Redirect to login after a delay
                    setTimeout(() => navigate('/login', { replace: true }), 2000);
                }
            } catch (err) {
                console.error('Auth callback error fetching status:', err);
                setError('An error occurred during authentication. Please try again.');
                toast.error('Authentication error.');
                 // Redirect to login after a delay
                setTimeout(() => navigate('/login', { replace: true }), 2000);
            }
        };

        verifySession();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Run only once on mount

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
            <h1 className="text-2xl mb-4">{message}</h1>
            {/* You can add a spinner here */}
            {error && <p className="text-red-500 mt-4">{error}</p>}
        </div>
    );
};

export default AuthCallback;

