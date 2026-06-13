"use client";
import { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Loader2, Video } from "lucide-react";
import axios from "axios";

type Phase = "setup" | "active" | "feedback";
type Mode = "text" | "voice";

function speakFallback(text: string) {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    window.speechSynthesis.speak(u);
  }
}

export default function InterviewPage() {
  const [phase, setPhase] = useState<Phase>("setup");
  const [mode, setMode] = useState<Mode>("voice");
  const [roundType, setRoundType] = useState<"technical" | "hr">("technical");
  const [targetRole, setTargetRole] = useState("Data Analyst");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);
  const [exchangeCount, setExchangeCount] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  useEffect(() => {
    if (videoUrl && videoRef.current) {
      videoRef.current.src = videoUrl;
      videoRef.current.play().catch(() => {});
    }
  }, [videoUrl]);

  async function startInterview() {
    setLoading(true);
    try {
      const endpoint = mode === "voice" ? "/api/voice-interview/start" : "/api/interview/start";
      const res = await axios.post(
        `${endpoint}?round_type=${roundType}&target_role=${encodeURIComponent(targetRole)}&use_avatar=${mode === "voice"}`,
        null, { timeout: 60000 }
      );
      setSessionId(res.data.session_id);
      setMessages([{ role: "interviewer", content: res.data.opening_message }]);
      if (res.data.video_url) {
        setVideoUrl(res.data.video_url);
      } else if (mode === "voice") {
        speakFallback(res.data.opening_message);
      }
      setPhase("active");
    } catch (e: any) {
      alert(e?.response?.data?.detail || "Failed to start interview");
    }
    setLoading(false);
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = e => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        await transcribeAndSend(audioBlob);
      };
      mediaRecorder.start();
      setIsRecording(true);
    } catch {
      alert("Microphone access denied. Please allow microphone and try again.");
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  }

  async function transcribeAndSend(audioBlob: Blob) {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");
      const transcribeRes = await axios.post(
        `/api/voice-interview/transcribe?session_id=${sessionId}`,
        formData, { timeout: 30000 }
      );
      const text = transcribeRes.data.transcript;
      setTranscript(text);
      if (text?.trim()) await sendAnswer(text);
      else setLoading(false);
    } catch (e) {
      console.error("Transcription failed", e);
      setLoading(false);
    }
  }

  async function sendAnswer(text?: string) {
    const userMsg = (text || answer).trim();
    if (!userMsg || !sessionId) return;
    setAnswer("");
    setTranscript("");
    setVideoUrl(null);
    setMessages(prev => [...prev, { role: "candidate", content: userMsg }]);
    setLoading(true);

    try {
      const endpoint = mode === "voice"
        ? `/api/voice-interview/respond/${sessionId}?candidate_answer=${encodeURIComponent(userMsg)}&use_avatar=true`
        : `/api/interview/respond/${sessionId}?candidate_answer=${encodeURIComponent(userMsg)}`;
      const res = await axios.post(endpoint, null, { timeout: 60000 });
      setMessages(prev => [...prev, { role: "interviewer", content: res.data.interviewer_response }]);
      setExchangeCount(res.data.total_exchanges);
      if (res.data.video_url) {
        setVideoUrl(res.data.video_url);
      } else if (mode === "voice") {
        speakFallback(res.data.interviewer_response);
      }
    } catch { }
    setLoading(false);
  }

  async function endInterview() {
    if (!sessionId) return;
    setLoading(true);
    try {
      const endpoint = mode === "voice" ? `/api/voice-interview/end/${sessionId}` : `/api/interview/end/${sessionId}`;
      const res = await axios.post(endpoint, null, { timeout: 30000 });
      setFeedback(res.data);
      setPhase("feedback");
    } catch { }
    setLoading(false);
  }

  const scoreColor = (s: number) => s >= 7 ? "var(--success)" : s >= 5 ? "var(--warning)" : "var(--destructive)";

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg-base)" }}>
      <nav style={{
        borderBottom: "1px solid var(--border)", padding: "0 2rem", height: "60px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, background: "var(--bg-base)", zIndex: 100,
      }}>
        <a href="/" style={{ fontWeight: 600, fontSize: "1.1rem", letterSpacing: "-0.02em", textDecoration: "none", color: "var(--text-primary)" }}>
          Vishwakarma
        </a>
        {phase === "active" && (
          <button onClick={endInterview} style={{
            background: "none", border: "1px solid var(--border)", borderRadius: "6px",
            padding: "0.4rem 1rem", color: "var(--text-muted)", fontSize: "0.8rem", cursor: "pointer",
          }}>End & Get Feedback</button>
        )}
      </nav>

      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "3rem 2rem" }}>
        {phase === "setup" && (
          <>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: "0.5rem" }}>Mock Interview</h1>
            <p style={{ color: "var(--text-muted)", marginBottom: "2.5rem", fontSize: "0.95rem" }}>Choose your mode, round, and role.</p>

            <div style={{ marginBottom: "1.25rem" }}>
              <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "0.5rem" }}>Interview Mode</label>
              <div style={{ display: "flex", gap: "0.75rem" }}>
                {(["voice", "text"] as const).map(m => (
                  <button key={m} onClick={() => setMode(m)} style={{
                    flex: 1, padding: "0.75rem", borderRadius: "8px", cursor: "pointer",
                    border: `1px solid ${mode === m ? "var(--accent)" : "var(--border)"}`,
                    background: mode === m ? "var(--accent-subtle)" : "var(--bg-surface)",
                    color: mode === m ? "var(--accent)" : "var(--text-muted)",
                    fontWeight: 500, fontSize: "0.9rem",
                  }}>
                    {m === "voice" ? "🎤 Voice + Avatar" : "💬 Text Chat"}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: "1.25rem" }}>
              <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "0.5rem" }}>Round Type</label>
              <div style={{ display: "flex", gap: "0.75rem" }}>
                {(["technical", "hr"] as const).map(r => (
                  <button key={r} onClick={() => setRoundType(r)} style={{
                    flex: 1, padding: "0.75rem", borderRadius: "8px", cursor: "pointer",
                    border: `1px solid ${roundType === r ? "var(--accent)" : "var(--border)"}`,
                    background: roundType === r ? "var(--accent-subtle)" : "var(--bg-surface)",
                    color: roundType === r ? "var(--accent)" : "var(--text-muted)",
                    fontWeight: 500, fontSize: "0.9rem",
                  }}>
                    {r === "technical" ? "Technical Round" : "HR Round"}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: "2rem" }}>
              <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "0.4rem" }}>Target Role</label>
              <input value={targetRole} onChange={e => setTargetRole(e.target.value)} style={{
                width: "100%", padding: "0.6rem 0.875rem", background: "var(--bg-surface)",
                border: "1px solid var(--border)", borderRadius: "6px", color: "var(--text-primary)", fontSize: "0.9rem", outline: "none",
              }} />
            </div>

            {mode === "voice" && (
              <div style={{ background: "var(--accent-subtle)", border: "1px solid var(--accent)", borderRadius: "8px", padding: "0.875rem", marginBottom: "1.5rem" }}>
                <p style={{ fontSize: "0.8rem", color: "var(--accent)" }}>
                  🎤 Hold the mic button to speak. Avatar response takes 5-10 seconds to generate.
                </p>
              </div>
            )}

            <button onClick={startInterview} disabled={loading} style={{
              width: "100%", padding: "0.875rem", borderRadius: "8px",
              background: "var(--accent)", color: "#fff", fontWeight: 600, fontSize: "0.95rem",
              border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
            }}>
              {loading ? <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> : null}
              Start Interview
            </button>
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
          </>
        )}

        {phase === "active" && (
          <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
              <div>
                <h2 style={{ fontWeight: 600, fontSize: "1.1rem" }}>{roundType === "technical" ? "Technical" : "HR"} Interview — {targetRole}</h2>
                <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{exchangeCount} exchanges</p>
              </div>
              <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "var(--success)" }} />
            </div>

            {mode === "voice" && (
              <div style={{
                background: "var(--bg-surface)", border: "1px solid var(--border)",
                borderRadius: "12px", overflow: "hidden", marginBottom: "1rem",
                aspectRatio: "16/9", display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {videoUrl ? (
                  <video ref={videoRef} autoPlay controls style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : loading ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
                    <Loader2 size={24} color="var(--accent)" style={{ animation: "spin 1s linear infinite" }} />
                    <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Generating avatar...</p>
                  </div>
                ) : (
                  <Video size={36} color="var(--text-muted)" />
                )}
              </div>
            )}

            <div style={{
              background: "var(--bg-surface)", border: "1px solid var(--border)",
              borderRadius: "12px", padding: "1.25rem",
              height: mode === "voice" ? "180px" : "400px",
              overflowY: "auto", marginBottom: "1rem",
              display: "flex", flexDirection: "column", gap: "0.75rem",
            }}>
              {messages.map((m, i) => (
                <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: m.role === "candidate" ? "flex-end" : "flex-start" }}>
                  <span style={{ fontSize: "0.65rem", color: "var(--text-muted)", marginBottom: "0.2rem" }}>
                    {m.role === "candidate" ? "You" : "Interviewer"}
                  </span>
                  <div style={{
                    maxWidth: "85%", padding: "0.6rem 0.875rem", borderRadius: "8px",
                    background: m.role === "candidate" ? "var(--accent-subtle)" : "var(--bg-elevated)",
                    border: `1px solid ${m.role === "candidate" ? "var(--accent)" : "var(--border)"}`,
                    fontSize: "0.875rem", lineHeight: 1.6,
                  }}>{m.content}</div>
                </div>
              ))}
              {loading && <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <Loader2 size={12} color="var(--text-muted)" style={{ animation: "spin 1s linear infinite" }} />
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Thinking...</span>
              </div>}
              <div ref={bottomRef} />
            </div>

            {mode === "voice" ? (
              <div>
                <button
                  onMouseDown={startRecording}
                  onMouseUp={stopRecording}
                  onTouchStart={startRecording}
                  onTouchEnd={stopRecording}
                  disabled={loading}
                  style={{
                    width: "100%", padding: "1rem", borderRadius: "8px",
                    background: isRecording ? "#1a0a0a" : "var(--bg-surface)",
                    border: `2px solid ${isRecording ? "var(--destructive)" : "var(--border)"}`,
                    color: isRecording ? "var(--destructive)" : "var(--text-secondary)",
                    cursor: loading ? "not-allowed" : "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                    fontWeight: 500, fontSize: "0.9rem",
                  }}
                >
                  {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
                  {isRecording ? "Release to send" : loading ? "Processing..." : "Hold to speak"}
                </button>
                {transcript && <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.5rem", textAlign: "center" }}>Heard: "{transcript}"</p>}
              </div>
            ) : (
              <div style={{ display: "flex", gap: "0.75rem" }}>
                <textarea
                  value={answer}
                  onChange={e => setAnswer(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendAnswer(); } }}
                  placeholder="Type your answer... (Enter to send)"
                  rows={3}
                  style={{
                    flex: 1, padding: "0.75rem", background: "var(--bg-surface)",
                    border: "1px solid var(--border)", borderRadius: "8px",
                    color: "var(--text-primary)", fontSize: "0.9rem", outline: "none", resize: "none",
                  }}
                />
                <button onClick={() => sendAnswer()} disabled={loading || !answer.trim()} style={{
                  padding: "0 1.25rem", borderRadius: "8px", background: "var(--accent)",
                  color: "#fff", border: "none", cursor: "pointer", fontWeight: 600,
                }}>Send</button>
              </div>
            )}
          </>
        )}

        {phase === "feedback" && feedback && (
          <>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: "0.5rem" }}>Interview Feedback</h1>
            <p style={{ color: "var(--text-muted)", marginBottom: "2rem", fontSize: "0.875rem" }}>
              {roundType === "technical" ? "Technical" : "HR"} Round — {targetRole}
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
              {[
                { label: "Overall", score: feedback.overall_score },
                { label: "Communication", score: feedback.communication_score },
                { label: "Technical", score: feedback.technical_score },
              ].map(({ label, score }) => (
                <div key={label} style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "10px", padding: "1.25rem", textAlign: "center" }}>
                  <p style={{ fontSize: "2rem", fontWeight: 700, color: scoreColor(score) }}>{score}<span style={{ fontSize: "1rem", color: "var(--text-muted)" }}>/10</span></p>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>{label}</p>
                </div>
              ))}
            </div>
            <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "10px", padding: "1.25rem", marginBottom: "1rem" }}>
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>Recommendation</p>
              <p style={{ fontWeight: 600, fontSize: "1rem", color: "var(--accent)", textTransform: "capitalize" }}>{feedback.recommendation}</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
              <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "10px", padding: "1.25rem" }}>
                <p style={{ fontSize: "0.75rem", color: "var(--success)", marginBottom: "0.75rem", fontWeight: 600 }}>STRENGTHS</p>
                {feedback.strengths?.map((s: string, i: number) => <p key={i} style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.3rem" }}>· {s}</p>)}
              </div>
              <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "10px", padding: "1.25rem" }}>
                <p style={{ fontSize: "0.75rem", color: "var(--warning)", marginBottom: "0.75rem", fontWeight: 600 }}>IMPROVE</p>
                {feedback.improvements?.map((s: string, i: number) => <p key={i} style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.3rem" }}>· {s}</p>)}
              </div>
            </div>
            <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "10px", padding: "1.25rem", marginBottom: "1.5rem" }}>
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>Detailed Feedback</p>
              <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.7 }}>{feedback.detailed_feedback}</p>
            </div>
            <div style={{ display: "flex", gap: "1rem" }}>
              <button onClick={() => { setPhase("setup"); setMessages([]); setFeedback(null); setSessionId(null); setExchangeCount(0); setVideoUrl(null); }} style={{
                flex: 1, padding: "0.75rem", borderRadius: "8px", background: "var(--bg-surface)",
                border: "1px solid var(--border)", color: "var(--text-secondary)", cursor: "pointer", fontWeight: 500,
              }}>Try Another Round</button>
              <a href="/dashboard" style={{
                flex: 1, padding: "0.75rem", borderRadius: "8px", background: "var(--accent)",
                color: "#fff", textDecoration: "none", textAlign: "center", fontWeight: 500,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>Back to Dashboard</a>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
