import axios from 'axios';

const LS_KEY = 'ai_ppap_api_base_url';
const resolveBase = () => {
  const ls = (typeof localStorage !== 'undefined' && localStorage.getItem(LS_KEY)) || null;
  const env = import.meta?.env?.VITE_API_BASE_URL || null;
  const base = (ls || env || 'http://localhost:8084').replace(/\/$/, '');
  return base;
};
const apiUrl = () => `${resolveBase()}/api/v1/evaluations`;

const getAuthHeaders = () => {
  const token = localStorage.getItem('ai_ppap_auth_token');
  return {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };
};

export const submitEvaluation = async (evaluationData) => {
  try {
    const response = await axios.post(apiUrl(), evaluationData, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error('Error submitting evaluation:', error);
    throw error;
  }
};

export const getEmployeeEvaluations = async (employeeId) => {
  try {
    const response = await axios.get(`${apiUrl()}/employee/${employeeId}`, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error('Error fetching employee evaluations:', error);
    throw error;
  }
};

export const getAssignedEvaluations = async (reviewerId) => {
  try {
    const response = await axios.get(`${apiUrl()}/reviewer/${reviewerId}`, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error('Error fetching assigned evaluations:', error);
    throw error;
  }
};

export const getDepartmentEvaluations = async (department) => {
  try {
    const response = await axios.get(`${apiUrl()}/department/${department}`, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error('Error fetching department evaluations:', error);
    throw error;
  }
};

export const updateEvaluationStatus = async (evaluationId, status) => {
  try {
    const response = await axios.put(
      `${apiUrl()}/${evaluationId}/status?status=${status}`,
      {},
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error('Error updating evaluation status:', error);
    throw error;
  }
};

export const deleteEvaluation = async (evaluationId) => {
  try {
    await axios.delete(`${apiUrl()}/${evaluationId}`, getAuthHeaders());
  } catch (error) {
    console.error('Error deleting evaluation:', error);
    throw error;
  }
};

export const getEmployeeAverageRatings = async (employeeId) => {
  try {
    const response = await axios.get(
      `${apiUrl()}/employee/${employeeId}/averages`,
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching average ratings:', error);
    throw error;
  }
};
