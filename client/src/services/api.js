const API_URL = 'http://localhost:5000/api';


export const loginUser = async (email, password) => {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Login failed');
    }

    return data;

};


export const logoutUser = async () => {
    const response = await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Logout failed');
    }

    return data;

};


export const signupUser = async (name, email, password) => {
    const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Signup failed');
    }

    return data;
};


export const createReport = async (formDataObj) => {
    const response = await fetch(`${API_URL}/reports`, {
        method: 'POST',
        credentials: 'include',
        body: formDataObj,
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Failed to submit report');
    }

    return data;
};


export const getProfile = async () => {
    const response = await fetch(`${API_URL}/auth/profile`, {
        credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok){
        throw new Error(data.message || 'Not authenticated');
    }

    return data;
};


export const getMyReports = async () => {
    const response = await fetch(`${API_URL}/reports/my-reports`, {
        credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch reports');
    }

    return data;
};