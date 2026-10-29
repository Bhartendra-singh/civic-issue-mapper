import { createContext, useContext, useState, useEffect } from 'react';
import { logoutUser, getProfile } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const checkAuth = async () => {
        try {
            const data = await getProfile();
            setUser(data.user);
        } catch (error) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);


    const login = (userData) => {
        setUser(userData);
    };

    const logout = async () => {
        try {
            await logoutUser();
        } catch (error) {
            console.error('Logout error:', error);
        }

        setUser(null);
    };


    return (
        <AuthContext.Provider value={{ user, login, logout, loading, refreshUser: checkAuth }}>
            {children}
        </AuthContext.Provider>
    ); 
}

export function useAuth() {
    return useContext(AuthContext);
}