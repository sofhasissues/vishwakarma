import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  timeout: 120000,
});

export async function parseResume(file: File, targetRole: string, targetLocation: string) {
  const form = new FormData();
  form.append("file", file);
  const res = await api.post(`/resume/parse?target_role=${encodeURIComponent(targetRole)}&target_location=${encodeURIComponent(targetLocation)}`, form);
  return res.data;
}

export async function getSkillGaps(file: File, targetRole: string, targetLocation: string) {
  const form = new FormData();
  form.append("file", file);
  const res = await api.post(`/analysis/gaps?target_role=${encodeURIComponent(targetRole)}&target_location=${encodeURIComponent(targetLocation)}`, form);
  return res.data;
}

export async function generateRoadmap(file: File, targetRole: string, targetLocation: string) {
  const form = new FormData();
  form.append("file", file);
  const res = await api.post(`/roadmap/generate?target_role=${encodeURIComponent(targetRole)}&target_location=${encodeURIComponent(targetLocation)}`, form);
  return res.data;
}

export async function startInterview(roundType: string, targetRole: string, skills: string, gaps: string) {
  const res = await api.post(`/interview/start?round_type=${roundType}&target_role=${encodeURIComponent(targetRole)}&skills=${encodeURIComponent(skills)}&gaps=${encodeURIComponent(gaps)}`);
  return res.data;
}

export async function respondToInterview(sessionId: string, answer: string) {
  const res = await api.post(`/interview/respond/${sessionId}?candidate_answer=${encodeURIComponent(answer)}`);
  return res.data;
}

export async function endInterview(sessionId: string) {
  const res = await api.post(`/interview/end/${sessionId}`);
  return res.data;
}

export function getAudioUrl(sessionId: string) {
  return `/api/interview/audio/${sessionId}`;
}
