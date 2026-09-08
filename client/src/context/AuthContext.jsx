import { createContext, useContext, useState } from 'react';


const AuthContext = createContext();

export function AuthProvider( { children }) {
    const [user, setuser] = useState(null);

    const login = (userData) => {
        setuser(userData);
    };

    const logout = () => {
        setuser(null);
    };


    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    ); 
}

export function useAuth() {
    return useContext(AuthContext);
}