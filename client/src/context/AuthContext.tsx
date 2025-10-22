import React, { createContext, useState, useContext, useEffect, ReactNode, SetStateAction, Dispatch } from 'react';
import axios from 'axios';

// --- 1. Define the User Type (Update with your user fields) ---
// This should match the user object your backend sends
interface User {
    id: string;
    username: string;
    email: string;
    // Add other fields like githubId, etc., if needed
}

// --- 2. Define the Context's Value Shape ---
interface AuthContextType {
    user: User | null;
    setUser: Dispatch<SetStateAction<User | null>>;
    isLoading: boolean;
}

// --- 3. Create the Context ---
// We provide a default value for autocomplete, but it won't be used
const AuthContext = createContext<AuthContextType>({
    user: null,
    setUser: () => null,
    isLoading: true,
});

// --- 4. Create the Provider Component ---

// Create a reusable axios instance
// This is what you'll use for ALL your API calls (login, signup, auth status)
const api = axios.create({
    baseURL:  process.env.VITE_BACKEND_URL,
    withCredentials: true, // This is essential for sessions!
});


interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true); // Start as true

    // Check auth status on initial app load
    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                // The browser automatically sends the session cookie
                const response = await api.get('/api/auth/status');

                if (response.data.isAuthenticated) {
                    setUser(response.data.user);
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error('Auth status check failed:', error);
                setUser(null);
            } finally {
                // Done loading, whether success or fail
                setIsLoading(false);
            }
        };

        checkAuthStatus();
    }, []); // Empty array means this runs only once on mount

    // The value object to be passed to consumers
    const value = {
        user,
        setUser, // We pass the 'setUser' from useState directly
        isLoading,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// --- 5. Create the Custom Hook ---
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// --- (Optional) Export the API instance ---
// This lets your other files (LoginPage, SignupPage) use the same
// pre-configured axios instance.
export { api };

