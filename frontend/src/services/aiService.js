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

export const analyzeText = async (texts) => {
  const payload = { texts };
  const resp = await axios.post(`${apiUrl()}/analyze-text`, payload, getAuthHeaders());
  return resp.data; // { sentiments: [{label,score}], keyPoints }
};

export const summarize = async (text, maxTokens) => {
  const payload = { text, maxTokens };
  const resp = await axios.post(`${apiUrl()}/summarize`, payload, getAuthHeaders());
  return resp.data; // { summary }
};

export const recommendations = async ({ role, competencyRatings, feedbackText }) => {
  const payload = { role, competencyRatings, feedbackText };
  const resp = await axios.post(`${apiUrl()}/recommendations`, payload, getAuthHeaders());
  return resp.data; // { strengths, weaknesses, growthAreas, suggestedActions }
};

export const evaluate = async ({ employeeName, role, competencyRatings, selfText, managerText, peerTexts }) => {
  const payload = { employeeName, role, competencyRatings, selfText, managerText, peerTexts };
  const resp = await axios.post(`${apiUrl()}/evaluate`, payload, getAuthHeaders());
  return resp.data; // { performanceScore, sentiments, summary, strengths, weaknesses, growthAreas, suggestedActions }
};
