import axios from "axios";

// --- Configuration & Utility Functions ---

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

/**
 * Utility function to get the current user's token.
 * This should be adjusted based on where you store your JWT.
 */
const getUserToken = () => {
  // Assuming the token is stored in sessionStorage as 'userToken' upon login
  return sessionStorage.getItem("userToken");
};

/**
 * Creates an axios instance with base configuration for authenticated calls.
 */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor to add Authorization header to all requests
apiClient.interceptors.request.use(
  (config) => {
    const token = getUserToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- User Endpoints (Users) ---

/**
 * POST /api/users/register
 * @param {object} userData - { name, email, password, role, profile }
 */
export async function registerUser(userData) {
  try {
    const response = await apiClient.post("/users/register", userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}

/**
 * POST /api/users/login
 * @param {object} credentials - { email, password }
 */
export async function loginUser(credentials) {
  try {
    const response = await apiClient.post("/users/login", credentials);
    // On successful login, you should store the token and user ID
    if (response.data.token) {
      sessionStorage.setItem("userToken", response.data.token);
    }
    if (response.data._id) {
      sessionStorage.setItem("userId", response.data._id);
    }
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}

/**
 * GET /api/users
 * @param {object} params - { role, page, limit, search }
 */
export async function getAllUsers(params = {}) {
  try {
    const response = await apiClient.get("/users", { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}

/**
 * GET /api/users/check-email/:email
 * @param {string} email
 */
export async function checkEmailExists(email) {
  try {
    const response = await apiClient.get(`/users/check-email/${email}`);
    return response.data; // Should return { exists: boolean }
  } catch (error) {
    throw error.response?.data || error;
  }
}

/**
 * GET /api/users/:id
 * @param {string} userId
 */
export async function getUserById(userId) {
  try {
    const response = await apiClient.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}

/**
 * PUT /api/users/:id
 * @param {string} userId
 * @param {object} updateData - { name, email, profile: { phone, location, bio } }
 */
export async function updateUserProfile(userId, updateData) {
  try {
    const response = await apiClient.put(`/users/${userId}`, updateData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}

/**
 * PUT /api/users/:id
 * @param {string} userId
 * @param {object} passwordData - { password }
 */
export async function updateUserPassword(userId, passwordData) {
  try {
    // Note: The Postman request suggests PUT /api/users/{{hrUserId}} with a password body,
    // but a dedicated endpoint like /api/users/:id/password or /api/users/password is safer.
    // Following the Postman collection's path for now, but often handled in a dedicated way on the backend.
    const response = await apiClient.put(`/users/${userId}`, passwordData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}

// --- Job Endpoints (Jobs) ---

/**
 * POST /api/jobs
 * @param {object} jobData - { title, description, requirements, skills, companyName, location, salary, hrId }
 */
export async function createJob(jobData) {
  try {
    const response = await apiClient.post("/jobs", jobData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}

/**
 * GET /api/jobs
 * @param {object} params - { status, skills, location, minSalary, maxSalary, page, limit }
 */
export async function getAllJobs(params = {}) {
  try {
    const response = await apiClient.get("/jobs", { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}

/**
 * GET /api/jobs/:id
 * @param {string} jobId
 */
export async function getJobById(jobId) {
  try {
    const response = await apiClient.get(`/jobs/${jobId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}

/**
 * PUT /api/jobs/:id
 * @param {string} jobId
 * @param {object} updateData - Partial job data to update
 */
export async function updateJob(jobId, updateData) {
  try {
    const response = await apiClient.put(`/jobs/${jobId}`, updateData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}

/**
 * DELETE /api/jobs/:id
 * @param {string} jobId
 */
export async function deleteJob(jobId) {
  try {
    const response = await apiClient.delete(`/jobs/${jobId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}

// --- Applicant Endpoints (Applicants) ---

/**
 * POST /api/applicants
 * Note: This endpoint expects 'form-data' with a 'resume' file.
 * @param {FormData} formData - Must contain 'userId', 'salaryExpectation', and 'resume' (File object)
 */
export async function createApplicantProfile(formData) {
  try {
    const response = await apiClient.post("/applicants", formData, {
      headers: {
        // Axios/fetch handles setting the correct boundary for 'multipart/form-data'
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}

/**
 * GET /api/applicants/:userId
 * @param {string} userId
 */
export async function getApplicantProfile(userId) {
  try {
    const response = await apiClient.get(`/applicants/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}

/**
 * PUT /api/applicants/:userId
 * @param {string} userId
 * @param {object} updateData - { salaryExpectation, structuredData }
 */
export async function updateApplicantProfile(userId, updateData) {
  try {
    const response = await apiClient.put(`/applicants/${userId}`, updateData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}

// --- Application Endpoints (Applications) ---

/**
 * POST /api/applications
 * @param {object} data - { jobId, applicantId }
 */
export async function applyToJob(data) {
  try {
    const response = await apiClient.post("/applications", data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}

/**
 * GET /api/applications/job/:jobId
 * @param {string} jobId
 * @param {object} params - { status, page, limit }
 */
export async function getApplicationsByJob(jobId, params = {}) {
  try {
    const response = await apiClient.get(`/applications/job/${jobId}`, {
      params,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}

/**
 * GET /api/applications/applicant/:applicantId
 * @param {string} applicantId
 */
export async function getApplicationsByApplicant(applicantId) {
  try {
    const response = await apiClient.get(
      `/applications/applicant/${applicantId}`
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}

/**
 * GET /api/applications/:id
 * @param {string} applicationId
 */
export async function getApplicationById(applicationId) {
  try {
    const response = await apiClient.get(`/applications/${applicationId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}

/**
 * POST /api/applications/:id/start-interview
 * @param {string} applicationId
 */
export async function startInterview(applicationId) {
  try {
    const response = await apiClient.post(
      `/applications/${applicationId}/start-interview`
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}

/**
 * PUT /api/applications/:id/status
 * @param {string} applicationId
 * @param {object} data - { status: string }
 */
export async function updateApplicationStatus(applicationId, data) {
  try {
    const response = await apiClient.put(
      `/applications/${applicationId}/status`,
      data
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}

// --- Report Endpoints (Reports) ---

/**
 * GET /api/reports/application/:applicationId
 * @param {string} applicationId
 */
export async function getReportByApplication(applicationId) {
  try {
    const response = await apiClient.get(
      `/reports/application/${applicationId}`
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}

/**
 * GET /api/reports/:reportId
 * @param {string} reportId
 */
export async function getReportById(reportId) {
  try {
    const response = await apiClient.get(`/reports/${reportId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}

/**
 * GET /api/reports/job/:jobId
 * @param {string} jobId
 * @param {object} params - { sortBy, order, page, limit }
 */
export async function getReportsByJob(jobId, params = {}) {
  try {
    const response = await apiClient.get(`/reports/job/${jobId}`, { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}

/**
 * GET /api/reports/:reportId/transcript
 * @param {string} reportId
 */
export async function getInterviewTranscript(reportId) {
  try {
    const response = await apiClient.get(`/reports/${reportId}/transcript`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}

/**
 * PUT /api/reports/:reportId/recommendation
 * @param {string} reportId
 * @param {object} data - { recommendation, notes }
 */
export async function updateReportRecommendation(reportId, data) {
  try {
    const response = await apiClient.put(
      `/reports/${reportId}/recommendation`,
      data
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}

/**
 * GET /api/reports/job/:jobId/stats
 * @param {string} jobId
 */
export async function getJobReportStatistics(jobId) {
  try {
    const response = await apiClient.get(`/reports/job/${jobId}/stats`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}
