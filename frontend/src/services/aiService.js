import axios from 'axios';

const LS_KEY = 'ai_ppap_api_base_url';
const resolveBase = () => {
  const ls = (typeof localStorage !== 'undefined' && localStorage.getItem(LS_KEY)) || null;
  const env = import.meta?.env?.VITE_API_BASE_URL || null;
  const base = (ls || env || 'http://localhost:8084').replace(/\/$/, '');
  return base;
};
// Backend AiController is mapped at /v1/ai
const apiUrl = () => `${resolveBase()}/v1/ai`;

const getAuthHeaders = () => {
  const token = localStorage.getItem('ai_ppap_auth_token');
  return {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };
};

export const draftEvaluation = async ({ employeeName, role, competencyRatings, context }) => {
  const payload = { employeeName, role, competencyRatings, context };
  const resp = await axios.post(`${apiUrl()}/draft-evaluation`, payload, getAuthHeaders());
  return resp.data; // { summary, competencyNotes }
};
