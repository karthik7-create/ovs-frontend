import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8080/api',
});

// Automatically attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth APIs
export const registerUser = (username, password) =>
  API.post('/auth/register', { username, password });

export const registerAdmin = (username, password, adminSecret) =>
  API.post('/auth/register-admin', { username, password, adminSecret });

export const loginUser = (username, password) =>
  API.post('/auth/login', { username, password });

// Candidate APIs
export const getCandidates = () => API.get('/candidates');

// Vote API
export const castVote = (candidateId) =>
  API.post('/vote', { candidateId });

// Results APIs
export const getResults = () => API.get('/results');

export const getResultsStatus = () => API.get('/results/status');

// Admin APIs
export const publishResults = () => API.post('/admin/publish-results');

export const unpublishResults = () => API.post('/admin/unpublish-results');

// Admin — Candidate Management
export const addCandidate = (name, party) =>
  API.post('/admin/candidates', { name, party });

export const removeCandidate = (id) =>
  API.delete(`/admin/candidates/${id}`);

// Admin — New Election
export const startNewElection = () => API.post('/admin/new-election');

export default API;
