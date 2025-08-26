import axios from 'axios'
const fromEnv = import.meta.env.VITE_API_BASE_URL
const fallback = `${window.location.protocol}//${window.location.hostname}:8082`
const API_BASE = fromEnv && fromEnv.trim() !== '' ? fromEnv : fallback
export const api = axios.create({ baseURL: API_BASE, headers: { 'Content-Type': 'application/json' } })
