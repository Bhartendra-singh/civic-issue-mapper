export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const SOCKET_URL = API_URL.replace(/\/api\/?$/, '');

let refreshPromise = null;

export async function tryRefreshToken() {
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    })
      .then((res) => res.ok)
      .catch(() => false)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

async function request(url, options = {}) {
  let response = await fetch(url, { ...options, credentials: 'include' });

  if (response.status === 401) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      response = await fetch(url, { ...options, credentials: 'include' });
    }
  }

  return response;
}

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
  const response = await request(`${API_URL}/reports`, {
    method: 'POST',
    body: formDataObj,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to submit report');
  }

  return data;
};

export const getProfile = async () => {
  const response = await request(`${API_URL}/auth/profile`);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Not authenticated');
  }

  return data;
};

export const getMyReports = async () => {
  const response = await request(`${API_URL}/reports/my-reports`);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch reports');
  }

  return data;
};

export const getAllPublicReports = async () => {
  const response = await fetch(`${API_URL}/reports/public`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch reports');
  }

  return data;
};

export const getAllReports = async () => {
  const response = await request(`${API_URL}/reports/all`);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch reports');
  }

  return data;
};

export const updateReportStatus = async (reportId, status) => {
  const response = await request(`${API_URL}/reports/${reportId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to update status');
  }

  return data;
};

export const verifyEmail = async (token) => {
  const response = await fetch(`${API_URL}/auth/verify-email/${token}`);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Verification failed');
  }

  return data;
};

export const forgotPassword = async (email) => {
  const response = await fetch(`${API_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
};

export const resetPassword = async (token, newPassword) => {
  const response = await fetch(`${API_URL}/auth/reset-password/${token}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ newPassword }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Reset failed');
  return data;
};

export const toggleUpvote = async (reportId) => {
  const response = await request(`${API_URL}/upvotes/${reportId}/toggle`, {
    method: 'PATCH',
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to update upvote');
  }

  return data;
};

export const reopenReport = async (reportId) => {
  const response = await request(`${API_URL}/reports/${reportId}/reopen`, {
    method: 'PATCH',
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to reopen report');
  }

  return data;
};


export const editReport = async (reportId, formData) => {
  const response = await request(`${API_URL}/reports/${reportId}`, {
    method: 'PATCH',
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to update report');
  }

  return data;
};

export const deleteReport = async (reportId) => {
  const response = await request(`${API_URL}/reports/${reportId}`, {
    method: 'DELETE',
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to delete report');
  }

  return data;
};

export const getComments = async (reportId) => {
  const response = await fetch(`${API_URL}/comments/${reportId}`);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch comments');
  }

  return data;
};


export const getDepartments = async () => {
  const response = await request(`${API_URL}/departments`);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch departments');
  }

  return data;
};

export const createDepartment = async (name, description, categories, slaHours) => {
  const response = await request(`${API_URL}/departments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, description, categories, slaHours }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to create department');
  }

  return data;
};

export const updateDepartment = async (departmentId, { name, description, categories, slaHours }) => {
  const response = await request(`${API_URL}/departments/${departmentId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, description, categories, slaHours }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to update department');
  }

  return data;
};

export const getAuditLogs = async () => {
  const response = await request(`${API_URL}/audit-logs`);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch audit logs');
  }

  return data;
};

export const getAnalytics = async () => {
  const response = await request(`${API_URL}/reports/analytics`);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch analytics');
  }

  return data;
};


export const getMyNotifications = async () => {
  const response = await request(`${API_URL}/notifications`);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch notifications');
  }

  return data;
};

export const markNotificationRead = async (notificationId) => {
  const response = await request(`${API_URL}/notifications/${notificationId}/read`, {
    method: 'PATCH',
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to update notification');
  }

  return data;
};

export const markAllNotificationsRead = async () => {
  const response = await request(`${API_URL}/notifications/read-all`, {
    method: 'PATCH',
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to update notifications');
  }

  return data;
};


export const getReportById = async (reportId) => {
  const response = await fetch(`${API_URL}/reports/${reportId}`, {
    credentials: 'include',
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch report');
  }

  return data;
};


export const postComment = async (reportId, text) => {
  const response = await request(`${API_URL}/comments/${reportId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to post comment');
  }

  return data;
};

export const deleteComment = async (commentId) => {
  const response = await request(`${API_URL}/comments/${commentId}`, {
    method: 'DELETE',
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to delete comment');
  }

  return data;
};

export const submitFeedback = async (reportId, rating, comment) => {
  const response = await request(`${API_URL}/feedback/${reportId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rating, comment }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to submit feedback');
  }

  return data;
};

export const getFeedback = async (reportId) => {
  const response = await fetch(`${API_URL}/feedback/${reportId}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch feedback');
  }

  return data;
};


export const getMyUpvotedReportIds = async () => {
  const response = await request(`${API_URL}/upvotes/my-upvotes`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch upvoted reports');
  }

  return data;
};


export const updateProfile = async (formData) => {
  const response = await request(`${API_URL}/auth/profile`, {
    method: 'PATCH',
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to update profile');
  }

  return data;
};


export const getReportsByCluster = async (clusterId) => {
  const response = await fetch(`${API_URL}/reports/cluster/${clusterId}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch similar reports');
  }

  return data;
};


export const suggestCategory = async (description) => {
  const response = await fetch(`${API_URL}/reports/suggest-category`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ description }),
  });

  const data = await response.json();
  return data;
};


export const sendAdminChatQuery = async (query) => {
  const response = await request(`${API_URL}/chat/admin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to get response');
  }

  return data;
};


export const sendUserChatQuery = async (query) => {
  const response = await request(`${API_URL}/chat/user`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to get response');
  }

  return data;
};


export const sendContactMessage = async ({ name, email, subject, message }) => {
  const response = await fetch(`${API_URL}/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, subject, message }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to send message');
  }

  return data;
};