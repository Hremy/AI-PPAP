import axios from 'axios';

const API_URL = '/api/evaluations';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };
};

export const submitEvaluation = async (evaluationData) => {
  try {
    const response = await axios.post(API_URL, evaluationData, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error('Error submitting evaluation:', error);
    throw error;
  }
};

export const getEmployeeEvaluations = async (employeeId) => {
  try {
    const response = await axios.get(`${API_URL}/employee/${employeeId}`, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error('Error fetching employee evaluations:', error);
    throw error;
  }
};

export const getAssignedEvaluations = async (reviewerId) => {
  try {
    const response = await axios.get(`${API_URL}/reviewer/${reviewerId}`, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error('Error fetching assigned evaluations:', error);
    throw error;
  }
};

export const getDepartmentEvaluations = async (department) => {
  try {
    const response = await axios.get(`${API_URL}/department/${department}`, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error('Error fetching department evaluations:', error);
    throw error;
  }
};

export const updateEvaluationStatus = async (evaluationId, status) => {
  try {
    const response = await axios.put(
      `${API_URL}/${evaluationId}/status?status=${status}`,
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
    await axios.delete(`${API_URL}/${evaluationId}`, getAuthHeaders());
  } catch (error) {
    console.error('Error deleting evaluation:', error);
    throw error;
  }
};

export const getEmployeeAverageRatings = async (employeeId) => {
  try {
    const response = await axios.get(
      `${API_URL}/employee/${employeeId}/averages`,
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching average ratings:', error);
    throw error;
  }
};
