import React, { createContext, useContext, useState, useEffect, ReactNode, Dispatch, SetStateAction } from 'react';
import axios, { AxiosInstance } from 'axios';

// --- 1. Define the User Type ---
// Ensure this matches the user object sent by your backend
export interface AuthUser {
  id: string;
  username: string;
  email?: string; // Make optional if not always present
}

// --- 2. Define the Context's Value Shape ---
interface AuthContextType {
  user: AuthUser | null;
  setUser: Dispatch<SetStateAction<AuthUser | null>>;
  isLoading: boolean;
  api: AxiosInstance; // Expose the pre-configured axios instance
  token: string | null; // <-- Add state for token
  setToken: (newToken: string | null) => void; // <-- Add wrapper setter
}

// --- 3. Create the Context ---
const AuthContext = createContext<AuthContextType| null>(null); // Cast for initial undefined

// --- 4. Create Pre-configured Axios Instance ---
// Use process.env - Vite typically replaces this during build
// Make sure VITE_BACKEND_URL is defined in your frontend .env file
export const api = axios.create({
  baseURL: process.env.VITE_BACKEND_URL || 'http://localhost:3000',
  // REMOVE: withCredentials: true, // Not needed for JWT Bearer tokens
});

// --- 5. Create the Provider Component ---
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setTokenState] = useState<string | null>(() => localStorage.getItem('authToken')); // Initialize from localStorage
  const [isLoading, setIsLoading] = useState(true); // Start true for initial check

  // --- Axios Request Interceptor ---
  useEffect(() => {
    const requestInterceptor = api.interceptors.request.use(
      (config) => {
        // Get token from state on each request
        // Re-read from localStorage directly in interceptor for potential updates
        const currentToken = localStorage.getItem('authToken');
        if (currentToken) {
          config.headers.Authorization = `Bearer ${currentToken}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Clean up interceptor on unmount
    return () => {
      api.interceptors.request.eject(requestInterceptor);
    };
  }, []); // Run interceptor setup once
  // --- End Interceptor ---

  // Wrapper for setToken to also update localStorage
  const setToken = (newToken: string | null) => {
      setTokenState(newToken); // Update state
      if (newToken) {
          localStorage.setItem('authToken', newToken);
          console.log("Token saved to localStorage");
      } else {
          localStorage.removeItem('authToken');
          console.log("Token removed from localStorage");
      }
  };


  // Check user status on initial load based on token
  useEffect(() => {
    const checkUserStatus = async () => {
        // Use the token currently in state (initialized from localStorage)
        const currentToken = token; // Use state token for check logic
        if (currentToken) {
            console.log("Found token in state, verifying...");
            try {
                // Verify token by calling the protected /status route
                // Interceptor automatically adds the Authorization header based on localStorage
                const response = await api.get('/api/auth/status');
                if (response.data.isAuthenticated && response.data.user) {
                    console.log("Token verified, setting user:", response.data.user);
                    setUser(response.data.user); // Set user data if token is valid
                } else {
                     console.log("Token invalid or expired according to backend.");
                     setToken(null); // Clear invalid token (state and localStorage)
                     setUser(null);
                }
            }

               
            catch (error ) {
                // @ts-expect-error TS2345 - Suppressing ArrayBufferLike error temporarily
                 console.error('Auth status check failed (likely invalid/expired token):', error.response?.data?.message || error.message);
                 setToken(null); // Clear token on error (state and localStorage)
                 setUser(null);
            }
        } else {
             // No token found initially
             console.log("No token found on initial load.");
             setUser(null);
        }
        setIsLoading(false); // Finished loading check
    };

    checkUserStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on initial mount


  // The value object passed to consumers
  const contextValue = {
    user,
    setUser,
    isLoading,
    api, // Provide the instance
    token, // Provide the current token from state
    setToken // Provide the wrapper function
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// --- 6. Create the Custom Hook ---
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Note: No longer need to export 'api' separately if it's in the context value

